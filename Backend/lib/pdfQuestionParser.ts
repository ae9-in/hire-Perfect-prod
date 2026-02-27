import fs from 'fs/promises';
import pdfParse from 'pdf-parse';
import { parseQuestionsFromRawText, ParsedQuestion } from './questionTextParser';

export async function parsePdfToQuestions(filePath: string): Promise<ParsedQuestion[]> {
    const fileBuffer = await fs.readFile(filePath);
    const parsed = await pdfParse(fileBuffer);
    return parseQuestionsFromRawText(parsed.text || '');
}
