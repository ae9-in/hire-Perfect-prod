import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Category from '../models/Category';
import Assessment from '../models/Assessment';
import Question from '../models/Question';
import { evaluateQuestionQuality, normalizeSourceQuestion } from '../lib/questionQuality';
import { normalizeQuestionText } from '../lib/questionValidation';

type Difficulty = 'easy' | 'medium' | 'hard';

type SourceRow = {
    assessmentId?: string;
    assessmentTitle?: string;
    type?: 'mcq' | 'scenario' | 'coding';
    question?: string;
    options?: string[];
    correctAnswer?: string | number;
    explanation?: string;
    points?: number;
    difficulty?: Difficulty;
    level?: string;
    tags?: string[];
    subtopic?: string;
};

type PreparedQuestion = {
    assessmentHint?: string;
    type: 'mcq' | 'scenario' | 'coding';
    question: string;
    options: string[];
    correctAnswer: string | number;
    explanation: string;
    points: number;
    difficulty: Difficulty;
    tags: string[];
};

const categoryFileMap: Record<string, string> = {
    'generative-ai-business-leaders': '1_Generative_AI_for_Business_Leaders',
    'prompt-engineering-ai-automation': '2_Prompt_Engineering',
    'data-engineering-cloud-pipelines': '3_data_engineering',
    'ui-ux-ai-products': '4_ui_ux_for_ai_products',
    'product-management-ai-era': '5_Product_Management_in_the_AI_Era',
    'cybersecurity-ethical-ai-security': '7_Cybersecurity',
    'digital-branding-creator-economy': '8_Digital_Branding',
    'financial-modeling-ai-tools': '9_Financial_Modelling_With_AI_Tools',
    'sustainable-business-esg-strategy': '10_Sustainable_Business_SG_Strategy',
    'growth-marketing-performance-strategy': '11_Growth_marketing_perfomance_strategy',
    'no-code-low-code-app-development': '12_No_code_Low_code_app_development',
    'advanced-excel-business-intelligence': '13_Advanced_Excel_Business_Intelligence',
    'ar-vr-spatial-computing': '14_AR_VR',
    'hr-analytics-people-strategy': '15_HR_ANALYTICS',
    'startup-incubation-venture-building': '16_Startup_Incubation',
    'ai-healthcare-biotech': '17_AI_in_Healthcare',
    'supply-chain-logistics-analytics': '18_Supply_Chain_Logistics_Analytics',
    'emotional-intelligence-leaders': '19_Emotional_Intelligence_for_Leaders',
    'ai-content-creation-media-production': '20_AI_Powered_Content_Creation_Media_Production',
};

const difficulties: Difficulty[] = ['easy', 'medium', 'hard'];
let globalPreparedCache: PreparedQuestion[] | null = null;

function readJsonArray(filePath: string): SourceRow[] {
    if (!fs.existsSync(filePath)) return [];
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const parsed = JSON.parse(content);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function resolveDifficulty(row: SourceRow): Difficulty {
    if (row.difficulty === 'easy' || row.level === 'easy' || row.level === 'beginner' || row.level === 'entry') return 'easy';
    if (row.difficulty === 'hard' || row.level === 'hard' || row.level === 'advanced' || row.level === 'expert') return 'hard';
    return 'medium';
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

function resolveAssessmentKey(label: string | undefined, knownTitles: Set<string>): string | undefined {
    if (!label) return undefined;
    const normalized = normalizeLookupName(label);
    if (!normalized) return undefined;
    if (knownTitles.has(normalized)) return normalized;

    const partialMatches = Array.from(knownTitles).filter((title) =>
        title.includes(normalized) || normalized.includes(title)
    );

    if (partialMatches.length === 1) {
        return partialMatches[0];
    }

    return undefined;
}

function dedupePrepared(rows: PreparedQuestion[]): PreparedQuestion[] {
    const seen = new Set<string>();
    return rows.filter((row) => {
        const key = `${row.assessmentHint || ''}:${row.difficulty}:${normalizeQuestionText(row.question)}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

function createQuestionDoc(row: PreparedQuestion, assessmentId: mongoose.Types.ObjectId) {
    return {
        assessment: assessmentId,
        type: row.type,
        question: row.question,
        options: row.options,
        correctAnswer: row.correctAnswer,
        explanation: row.explanation,
        points: row.points,
        difficulty: row.difficulty,
        tags: row.tags,
        normalizedQuestion: normalizeQuestionText(row.question),
        createdAt: new Date(),
        updatedAt: new Date(),
    };
}

function prepareSourceRows(rows: SourceRow[], titleSet?: Set<string>): PreparedQuestion[] {
    return dedupePrepared(
        rows.flatMap((row) => {
            const normalized = normalizeSourceQuestion(row);
            const tags = [...normalized.tags];
            if (row.subtopic) tags.push(String(row.subtopic));

            const quality = evaluateQuestionQuality({
                ...row,
                question: normalized.question,
                options: normalized.options,
                tags,
            });

            if (!quality.isUsable) {
                return [];
            }

            const assessmentHint = titleSet
                ? resolveAssessmentKey(row.subtopic || row.assessmentTitle, titleSet)
                : undefined;

            const parsedCorrectAnswer = typeof row.correctAnswer === 'number'
                ? row.correctAnswer
                : Number(row.correctAnswer ?? 0);

            return [{
                assessmentHint,
                type: row.type || 'mcq',
                question: normalized.question,
                options: normalized.options,
                correctAnswer: Number.isInteger(parsedCorrectAnswer) ? parsedCorrectAnswer : 0,
                explanation: String(row.explanation || '').trim(),
                points: typeof row.points === 'number' && row.points > 0 ? row.points : 1,
                difficulty: resolveDifficulty(row),
                tags,
            } satisfies PreparedQuestion];
        })
    );
}

function loadGlobalPreparedRows(): PreparedQuestion[] {
    if (globalPreparedCache) {
        return globalPreparedCache;
    }

    const allRows = Object.values(categoryFileMap).flatMap((fileBase) => {
        const validatedPath = path.join(process.cwd(), 'validated-json', `${fileBase}.validated.json`);
        const processedPath = path.join(process.cwd(), 'processed-json', `${fileBase}.json`);
        return [...readJsonArray(validatedPath), ...readJsonArray(processedPath)];
    });

    globalPreparedCache = prepareSourceRows(allRows);
    return globalPreparedCache;
}

async function run() {
    dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
    const { default: connectDB } = await import('../lib/db');
    await connectDB();

    const categories = await Category.find({
        slug: { $ne: 'blockchain-web3-applications' },
        isActive: { $ne: false },
    }).select('_id slug name');

    const summary: Array<Record<string, unknown>> = [];

    for (const category of categories) {
        const fileBase = categoryFileMap[category.slug];
        if (!fileBase) {
            summary.push({ slug: category.slug, skipped: true, reason: 'No source file mapping' });
            continue;
        }

        const validatedPath = path.join(process.cwd(), 'validated-json', `${fileBase}.validated.json`);
        const processedPath = path.join(process.cwd(), 'processed-json', `${fileBase}.json`);
        const sourceRows = [...readJsonArray(validatedPath), ...readJsonArray(processedPath)];

        const assessments = await Assessment.find({
            category: category._id,
            isActive: { $ne: false },
        }).select('_id title');

        const normalizedTitles = new Map<string, mongoose.Types.ObjectId>();
        const titleSet = new Set<string>();
        for (const assessment of assessments) {
            const normalized = normalizeLookupName(assessment.title);
            normalizedTitles.set(normalized, assessment._id);
            titleSet.add(normalized);
        }

        const preparedRows = prepareSourceRows(sourceRows, titleSet);
        const globalPreparedRows = loadGlobalPreparedRows();

        const existingBrokenCount = await Question.countDocuments({
            assessment: { $in: assessments.map((assessment) => assessment._id) },
            $or: [
                { question: /\[variant\s+\d+\]/i },
                { question: /practice question/i },
                { tags: 'autogenerated-fallback' },
                { tags: 'dummy' },
                { question: /scenario:\s*scenario:/i },
            ],
        });

        const categoryRowsByDifficulty = new Map<Difficulty, PreparedQuestion[]>();
        const directRowsByAssessment = new Map<string, Map<Difficulty, PreparedQuestion[]>>();
        const anyCategoryRows = preparedRows;

        for (const difficulty of difficulties) {
            categoryRowsByDifficulty.set(difficulty, preparedRows.filter((row) => row.difficulty === difficulty));
        }

        for (const assessment of assessments) {
            const assessmentKey = normalizeLookupName(assessment.title);
            const byDifficulty = new Map<Difficulty, PreparedQuestion[]>();
            for (const difficulty of difficulties) {
                byDifficulty.set(
                    difficulty,
                    preparedRows.filter((row) => row.assessmentHint === assessmentKey && row.difficulty === difficulty)
                );
            }
            directRowsByAssessment.set(String(assessment._id), byDifficulty);
        }

        let insertedQuestions = 0;
        let usedGlobalFallback = false;

        for (const assessment of assessments) {
            const docs: Array<Record<string, unknown>> = [];
            const perAssessmentSeen = new Set<string>();
            const direct = directRowsByAssessment.get(String(assessment._id))!;

            for (const difficulty of difficulties) {
                const preferred = direct.get(difficulty) || [];
                const fallback = categoryRowsByDifficulty.get(difficulty) || [];
                const crossDifficultyFallback = anyCategoryRows.map((row) => ({
                    ...row,
                    difficulty,
                }));
                const globalDifficultyFallback = globalPreparedRows
                    .filter((row) => row.difficulty === difficulty)
                    .map((row) => ({ ...row, difficulty }));
                const globalAnyFallback = globalPreparedRows.map((row) => ({
                    ...row,
                    difficulty,
                }));
                const pool = [
                    ...preferred,
                    ...fallback,
                    ...crossDifficultyFallback,
                    ...globalDifficultyFallback,
                    ...globalAnyFallback,
                ];

                for (const row of pool) {
                    const normalized = normalizeQuestionText(row.question);
                    if (perAssessmentSeen.has(normalized)) continue;
                    perAssessmentSeen.add(normalized);
                    docs.push(createQuestionDoc(row, assessment._id));
                    if (!preparedRows.includes(row) && !preferred.includes(row) && !fallback.includes(row)) {
                        usedGlobalFallback = true;
                    }
                    if (docs.filter((doc) => doc.difficulty === difficulty).length === 50) {
                        break;
                    }
                }

                const countForDifficulty = docs.filter((doc) => doc.difficulty === difficulty).length;
                if (countForDifficulty < 50) {
                    throw new Error(`Insufficient usable ${difficulty} questions for assessment "${assessment.title}" in category "${category.slug}"`);
                }
            }

            await Question.deleteMany({ assessment: assessment._id });
            await Question.insertMany(docs, { ordered: true });
            insertedQuestions += docs.length;
        }

        await Assessment.updateMany(
            { category: category._id },
            { $set: { duration: 50, totalQuestions: 50, updatedAt: new Date() } }
        );

        summary.push({
            slug: category.slug,
            assessments: assessments.length,
            sourceRows: sourceRows.length,
            usableRows: preparedRows.length,
            existingBrokenCount,
            insertedQuestions,
            usedGlobalFallback,
        });
    }

    console.log(JSON.stringify(summary, null, 2));
    await mongoose.disconnect();
}

run().catch(async (error) => {
    console.error(error);
    try {
        await mongoose.disconnect();
    } catch {
        // ignore disconnect errors during cleanup
    }
    process.exit(1);
});
