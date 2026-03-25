import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import { pathToFileURL } from 'url';
import mongoose from 'mongoose';
import Assessment from '../models/Assessment';
import Category from '../models/Category';
import Question from '../models/Question';
import { isValidObjectId, normalizeQuestionText, validateQuestionPayload } from '../lib/questionValidation';
import { evaluateQuestionQuality, normalizeSourceQuestion } from '../lib/questionQuality';

type ImportMode = 'validate' | 'preview' | 'import';

type RawQuestion = {
    assessmentId?: string;
    assessmentTitle?: string;
    type?: 'mcq' | 'scenario' | 'coding';
    question?: string;
    options?: string[];
    correctAnswer?: string | number;
    explanation?: string;
    points?: number;
    difficulty?: 'easy' | 'medium' | 'hard';
    level?: string;
    tags?: string[];
    subtopic?: string;
};

type ParsedArgs = {
    file: string;
    mode: ImportMode;
    assessmentId?: string;
    categorySlug?: string;
};

type AssessmentLookupEntry = {
    normalizedTitle: string;
    assessmentId: string;
};

type ImportLog = {
    timestamp: string;
    fileName: string;
    mode: ImportMode;
    totalRows: number;
    validRows: number;
    invalidRows: number;
    duplicateRowsInFile: number;
    duplicateRowsInDb: number;
    insertedRows: number;
    errors: Array<{ row: number; message: string }>;
};

function resolveDifficulty(raw: RawQuestion): 'easy' | 'medium' | 'hard' {
    if (raw.difficulty) return raw.difficulty;
    const level = (raw.level || '').toLowerCase();
    if (level === 'easy') return 'easy';
    if (level === 'medium') return 'medium';
    if (level === 'hard') return 'hard';
    if (level === 'entry' || level === 'beginner') return 'easy';
    if (level === 'advanced' || level === 'expert') return 'hard';
    return 'medium';
}

function parseArgs(args: string[]): ParsedArgs {
    const fileArg = args.find((arg) => arg.startsWith('--file='));
    const modeArg = args.find((arg) => arg.startsWith('--mode='));
    const assessmentArg = args.find((arg) => arg.startsWith('--assessmentId='));
    const categoryArg = args.find((arg) => arg.startsWith('--categorySlug='));
    const fileFromEnv = process.env.npm_config_file;
    const modeFromEnv = process.env.npm_config_mode;
    const assessmentFromEnv = process.env.npm_config_assessmentid;
    const categoryFromEnv = process.env.npm_config_categoryslug;

    const fileValue = fileArg?.split('=')[1] || fileFromEnv;
    if (!fileValue) {
        throw new Error('Missing required --file argument');
    }

    const mode = (modeArg?.split('=')[1] || modeFromEnv || 'validate') as ImportMode;
    if (!['validate', 'preview', 'import'].includes(mode)) {
        throw new Error('Invalid --mode. Use validate | preview | import');
    }

    return {
        file: fileValue,
        mode,
        assessmentId: assessmentArg?.split('=')[1] || assessmentFromEnv,
        categorySlug: categoryArg?.split('=')[1] || categoryFromEnv,
    };
}

function normalizeLookupName(value: string): string {
    return value
        .toLowerCase()
        .replace(/\bprotyping\b/g, 'prototyping')
        .replace(/\bai based\b/g, 'ai-based')
        .replace(/\bsoc operations\b/g, 'soc operations overview')
        .replace(/\bcontent repurposing system\b/g, 'content repurposing systems')
        .replace(/\bclinical decision support cds\b/g, 'clinical decision support')
        .replace(/\binvestor pitch decks?\b/g, 'investor pitch decks')
        .replace(/\([^)]*\)/g, ' ')
        .replace(/&/g, ' and ')
        .replace(/\+/g, ' plus ')
        .replace(/[^a-z0-9]+/g, ' ')
        .replace(/\band\b/g, ' ')
        .replace(/\bplus\b/g, ' ')
        .trim()
        .replace(/\s+/g, ' ');
}

async function ensureDir(dirPath: string): Promise<void> {
    await fs.mkdir(dirPath, { recursive: true });
}

function resolveAssessmentIdByLabel(
    label: string | undefined,
    entries: AssessmentLookupEntry[]
): string | undefined {
    if (!label) return undefined;
    const normalized = normalizeLookupName(label);
    if (!normalized) return undefined;

    // Exact normalized match
    const exact = entries.find((entry) => entry.normalizedTitle === normalized);
    if (exact) return exact.assessmentId;

    // Unique partial match fallback (e.g. "soc operations" -> "soc operations overview")
    const partialMatches = entries.filter((entry) =>
        entry.normalizedTitle.includes(normalized) || normalized.includes(entry.normalizedTitle)
    );
    if (partialMatches.length === 1) {
        return partialMatches[0].assessmentId;
    }

    return undefined;
}

export async function runImportQuestions(argsInput?: string[]): Promise<void> {
    dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

    const { file, mode, assessmentId: forcedAssessmentId, categorySlug } = parseArgs(argsInput ?? process.argv.slice(2));
    const rootDir = process.cwd();
    const filePath = path.resolve(rootDir, file);
    const importLogsDir = path.resolve(rootDir, 'import-logs');
    const validatedDir = path.resolve(rootDir, 'validated-json');

    const rawText = await fs.readFile(filePath, 'utf-8');
    const rawData = JSON.parse(rawText);

    if (!Array.isArray(rawData)) {
        throw new Error('Input JSON must be an array of question objects');
    }

    const { default: connectDB } = await import('../lib/db');
    await connectDB();

    if (forcedAssessmentId) {
        const assessment = await Assessment.findById(forcedAssessmentId).select('_id');
        if (!assessment) {
            throw new Error(`Assessment not found: ${forcedAssessmentId}`);
        }
    }

    const subtopicAssessmentMap = new Map<string, string>();
    const subtopicAssessmentEntries: AssessmentLookupEntry[] = [];
    if (!forcedAssessmentId && categorySlug) {
        const category = await Category.findOne({ slug: categorySlug }).select('_id name slug');
        if (!category) {
            throw new Error(`Category not found for slug: ${categorySlug}`);
        }

        const assessmentsInCategory = await Assessment.find({ category: category._id }).select('_id title');
        for (const assessment of assessmentsInCategory) {
            const normalizedTitle = normalizeLookupName(assessment.title);
            const assessmentId = String(assessment._id);
            subtopicAssessmentMap.set(normalizedTitle, assessmentId);
            subtopicAssessmentEntries.push({ normalizedTitle, assessmentId });
        }
    }

    const log: ImportLog = {
        timestamp: new Date().toISOString(),
        fileName: path.basename(filePath),
        mode,
        totalRows: rawData.length,
        validRows: 0,
        invalidRows: 0,
        duplicateRowsInFile: 0,
        duplicateRowsInDb: 0,
        insertedRows: 0,
        errors: [],
    };

    const inFileKeys = new Set<string>();
    const normalizedRows: Array<Record<string, unknown>> = [];

    for (let i = 0; i < rawData.length; i++) {
        const row = rawData[i] as RawQuestion;
        const mappedBySubtopic = row.subtopic
            ? (subtopicAssessmentMap.get(normalizeLookupName(row.subtopic))
                || resolveAssessmentIdByLabel(row.subtopic, subtopicAssessmentEntries))
            : undefined;
        const mappedByTitle = row.assessmentTitle
            ? (subtopicAssessmentMap.get(normalizeLookupName(row.assessmentTitle))
                || resolveAssessmentIdByLabel(row.assessmentTitle, subtopicAssessmentEntries))
            : undefined;
        const assessmentId = forcedAssessmentId || row.assessmentId || mappedBySubtopic || mappedByTitle;

        if (!assessmentId) {
            log.invalidRows += 1;
            log.errors.push({
                row: i + 1,
                message: categorySlug
                    ? `Could not map assessment for subtopic "${row.subtopic || row.assessmentTitle || 'unknown'}" in category ${categorySlug}`
                    : 'assessmentId is required in row or --assessmentId argument',
            });
            continue;
        }

        if (!isValidObjectId(assessmentId)) {
            log.invalidRows += 1;
            log.errors.push({ row: i + 1, message: `Invalid assessmentId: ${assessmentId}` });
            continue;
        }

        const tags = [...(row.tags || [])];
        if (row.subtopic) tags.push(row.subtopic);
        const normalizedSource = normalizeSourceQuestion(row);
        const quality = evaluateQuestionQuality({
            ...row,
            question: normalizedSource.question,
            options: normalizedSource.options,
            tags,
        });

        if (!quality.isUsable) {
            log.invalidRows += 1;
            log.errors.push({ row: i + 1, message: quality.reasons.join('; ') });
            continue;
        }

        const payload = validateQuestionPayload({
            assessmentId,
            type: row.type || 'mcq',
            question: normalizedSource.question,
            options: normalizedSource.options,
            correctAnswer: row.correctAnswer,
            explanation: row.explanation,
            points: row.points ?? 1,
            difficulty: resolveDifficulty(row),
            tags: [...normalizedSource.tags, ...tags],
        });

        if (!payload.value) {
            log.invalidRows += 1;
            log.errors.push({ row: i + 1, message: payload.errors.join('; ') });
            continue;
        }

        const uniqueKey = `${assessmentId}:${normalizeQuestionText(payload.value.question)}`;
        if (inFileKeys.has(uniqueKey)) {
            log.duplicateRowsInFile += 1;
            continue;
        }

        inFileKeys.add(uniqueKey);
        normalizedRows.push({
            assessment: assessmentId,
            type: payload.value.type,
            question: payload.value.question,
            options: payload.value.options,
            correctAnswer: payload.value.correctAnswer,
            explanation: payload.value.explanation,
            points: payload.value.points,
            difficulty: payload.value.difficulty,
            tags: payload.value.tags,
        });
    }

    const grouped = new Map<string, Set<string>>();
    for (const row of normalizedRows) {
        const assessment = String(row.assessment);
        const normalized = normalizeQuestionText(String(row.question));
        if (!grouped.has(assessment)) {
            grouped.set(assessment, new Set<string>());
        }
        grouped.get(assessment)!.add(normalized);
    }

    const dbDuplicateKeys = new Set<string>();
    for (const [assessment, normalizedSet] of grouped.entries()) {
        const normalizedList = Array.from(normalizedSet);
        const existingRows = await Question.find({
            assessment,
            normalizedQuestion: { $in: normalizedList },
        }).select('assessment normalizedQuestion');

        for (const existing of existingRows) {
            dbDuplicateKeys.add(`${existing.assessment.toString()}:${existing.normalizedQuestion}`);
        }
    }

    const importRows = normalizedRows.filter((row) => {
        const key = `${String(row.assessment)}:${normalizeQuestionText(String(row.question))}`;
        if (dbDuplicateKeys.has(key)) {
            log.duplicateRowsInDb += 1;
            return false;
        }
        return true;
    });

    log.validRows = importRows.length;

    if (mode === 'preview') {
        const preview = importRows.slice(0, 10);
        console.log('Preview first rows:');
        console.table(preview.map((row) => ({
            assessment: String(row.assessment),
            question: String(row.question).slice(0, 90),
            correctAnswer: row.correctAnswer,
            difficulty: row.difficulty,
        })));
    }

    if (mode === 'import' && importRows.length > 0) {
        const insertResult = await Question.insertMany(importRows, { ordered: false });
        log.insertedRows = insertResult.length;
    }

    await ensureDir(validatedDir);
    const validatedPath = path.resolve(
        validatedDir,
        `${path.basename(filePath, path.extname(filePath))}.validated.json`
    );
    await fs.writeFile(validatedPath, JSON.stringify(importRows, null, 2), 'utf-8');

    await ensureDir(importLogsDir);
    const safeTimestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const logPath = path.resolve(importLogsDir, `import-log-${safeTimestamp}.json`);
    await fs.writeFile(logPath, JSON.stringify(log, null, 2), 'utf-8');

    console.log(JSON.stringify({ summary: log, validatedPath, logPath }, null, 2));
    await mongoose.disconnect();
}

const isDirectExecution = process.argv[1]
    ? import.meta.url === pathToFileURL(process.argv[1]).href
    : false;

if (isDirectExecution) {
    runImportQuestions().catch((error) => {
        console.error('Import failed:', error.message);
        void mongoose.disconnect();
        process.exit(1);
    });
}
