import mammoth from 'mammoth';
import { parseQuestionsFromRawText, ParsedQuestion } from './questionTextParser';

export async function parseDocxToQuestions(filePath: string): Promise<ParsedQuestion[]> {
    const result = await mammoth.extractRawText({ path: filePath });
    return parseQuestionsFromRawText(result.value);
}
