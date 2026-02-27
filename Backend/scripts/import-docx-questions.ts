import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { parseDocxToQuestions } from '../lib/docxQuestionParser';
import { parsePdfToQuestions } from '../lib/pdfQuestionParser';
import { runImportQuestions } from './import-questions';

type Mode = 'validate' | 'preview' | 'import';

function parseArgs(args: string[]): { file: string; assessmentId?: string; categorySlug?: string; mode: Mode; output?: string } {
    const fileArg = args.find((arg) => arg.startsWith('--file='));
    const assessmentArg = args.find((arg) => arg.startsWith('--assessmentId='));
    const categoryArg = args.find((arg) => arg.startsWith('--categorySlug='));
    const modeArg = args.find((arg) => arg.startsWith('--mode='));
    const outputArg = args.find((arg) => arg.startsWith('--output='));
    const fileFromEnv = process.env.npm_config_file;
    const assessmentFromEnv = process.env.npm_config_assessmentid;
    const categoryFromEnv = process.env.npm_config_categoryslug;
    const modeFromEnv = process.env.npm_config_mode;
    const outputFromEnv = process.env.npm_config_output;

    const fileValue = fileArg?.split('=')[1] || fileFromEnv;
    if (!fileValue) {
        throw new Error('Missing required --file argument (path to .docx or .pdf)');
    }

    const mode = (modeArg?.split('=')[1] || modeFromEnv || 'preview') as Mode;
    if (!['validate', 'preview', 'import'].includes(mode)) {
        throw new Error('Invalid --mode. Use validate | preview | import');
    }

    return {
        file: fileValue,
        assessmentId: assessmentArg?.split('=')[1] || assessmentFromEnv,
        categorySlug: categoryArg?.split('=')[1] || categoryFromEnv,
        mode,
        output: outputArg?.split('=')[1] || outputFromEnv,
    };
}

async function ensureDir(dirPath: string): Promise<void> {
    await fs.mkdir(dirPath, { recursive: true });
}

async function runImportScript({
    processedFilePath,
    mode,
    assessmentId,
    categorySlug,
}: {
    processedFilePath: string;
    mode: Mode;
    assessmentId?: string;
    categorySlug?: string;
}): Promise<void> {
    const args = [`--mode=${mode}`, `--file=${processedFilePath}`];
    if (assessmentId) {
        args.push(`--assessmentId=${assessmentId}`);
    }
    if (categorySlug) {
        args.push(`--categorySlug=${categorySlug}`);
    }
    await runImportQuestions(args);
}

async function run(): Promise<void> {
    dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

    const { file, assessmentId, categorySlug, mode, output } = parseArgs(process.argv.slice(2));
    const rootDir = process.cwd();
    const inputPath = path.resolve(rootDir, file);

    const extension = path.extname(inputPath).toLowerCase();
    if (extension !== '.docx' && extension !== '.pdf') {
        throw new Error('--file must point to a .docx or .pdf file');
    }

    const parsedQuestions = extension === '.pdf'
        ? await parsePdfToQuestions(inputPath)
        : await parseDocxToQuestions(inputPath);

    if (parsedQuestions.length === 0) {
        throw new Error(`No valid questions parsed from ${extension.toUpperCase()} file. Check document format.`);
    }

    const processedDir = path.resolve(rootDir, 'processed-json');
    await ensureDir(processedDir);

    const outputPath = output
        ? path.resolve(rootDir, output)
        : path.resolve(
            processedDir,
            `${path.basename(inputPath, path.extname(inputPath))}.json`
        );

    await fs.writeFile(outputPath, JSON.stringify(parsedQuestions, null, 2), 'utf-8');
    console.log(`Parsed ${extension.toUpperCase()} -> JSON: ${outputPath}`);
    console.log(`Total parsed questions: ${parsedQuestions.length}`);

    await runImportScript({
        processedFilePath: outputPath,
        mode,
        assessmentId,
        categorySlug,
    });
}

run().catch((error) => {
    console.error('File import pipeline failed:', error.message);
    void mongoose.disconnect();
    process.exit(1);
});
