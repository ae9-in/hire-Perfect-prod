export type ParsedQuestion = {
    subtopic?: string;
    level?: string;
    questionNumber?: number;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;
    tags: string[];
};

type ParseState = {
    subtopic?: string;
    level?: string;
};

function cleanupLine(line: string): string {
    return line.replace(/\t/g, ' ').replace(/\s+/g, ' ').trim();
}

function parseOption(line: string): string | null {
    const match = line.match(/^(?:[A-Da-d][\).\:\-]|Option\s*[A-Da-d][\).\:\-]?)\s*(.+)$/);
    return match ? match[1].trim() : null;
}

function parseQuestionLine(line: string): { number?: number; text: string } | null {
    const match = line.match(/^(?:Q(?:uestion)?\s*)?(\d+)[\).\:\-]?\s+(.+)$/i);
    if (!match) return null;
    return { number: Number(match[1]), text: match[2].trim() };
}

function parseCorrectAnswer(line: string): number | null {
    const match = line.match(/^(?:Correct\s*Answer|Answer|Ans)\s*[:\-]\s*(.+)$/i);
    if (!match) return null;

    const raw = match[1].trim();
    const letterMatch = raw.match(/^[A-Da-d]$/);
    if (letterMatch) {
        return letterMatch[0].toUpperCase().charCodeAt(0) - 65;
    }

    const numeric = Number(raw);
    if (Number.isInteger(numeric)) {
        if (numeric >= 0 && numeric <= 3) return numeric;
        if (numeric >= 1 && numeric <= 4) return numeric - 1;
    }

    return null;
}

export function parseQuestionsFromRawText(rawText: string): ParsedQuestion[] {
    const lines = rawText
        .split(/\r?\n/)
        .map(cleanupLine)
        .filter(Boolean);

    const state: ParseState = {};
    const questions: ParsedQuestion[] = [];

    let current: Partial<ParsedQuestion> | null = null;
    let pendingExplanation: string[] = [];

    const finalizeCurrent = () => {
        if (!current) return;
        if (!current.question || !Array.isArray(current.options) || current.options.length !== 4) {
            current = null;
            pendingExplanation = [];
            return;
        }
        if (typeof current.correctAnswer !== 'number' || current.correctAnswer < 0 || current.correctAnswer > 3) {
            current = null;
            pendingExplanation = [];
            return;
        }

        const explanation = pendingExplanation.join(' ').trim();
        const tags = new Set<string>();
        if (state.subtopic) tags.add(state.subtopic.toLowerCase());
        if (state.level) tags.add(state.level.toLowerCase());

        questions.push({
            subtopic: state.subtopic,
            level: state.level,
            questionNumber: current.questionNumber,
            question: current.question,
            options: current.options,
            correctAnswer: current.correctAnswer,
            explanation: explanation || '',
            tags: [...tags],
        });

        current = null;
        pendingExplanation = [];
    };

    for (const line of lines) {
        if (/^subtopic\s*[:\-]/i.test(line)) {
            finalizeCurrent();
            state.subtopic = line.replace(/^subtopic\s*[:\-]\s*/i, '').trim();
            continue;
        }

        if (/^level\s*[:\-]/i.test(line)) {
            finalizeCurrent();
            state.level = line.replace(/^level\s*[:\-]\s*/i, '').trim();
            continue;
        }

        const parsedQuestion = parseQuestionLine(line);
        if (parsedQuestion) {
            finalizeCurrent();
            current = {
                questionNumber: parsedQuestion.number,
                question: parsedQuestion.text,
                options: [],
            };
            continue;
        }

        if (!current) continue;

        const option = parseOption(line);
        if (option) {
            current.options = [...(current.options || []), option];
            continue;
        }

        const answer = parseCorrectAnswer(line);
        if (answer !== null) {
            current.correctAnswer = answer;
            continue;
        }

        if (/^explanation\s*[:\-]/i.test(line)) {
            pendingExplanation.push(line.replace(/^explanation\s*[:\-]\s*/i, '').trim());
            continue;
        }

        if (pendingExplanation.length > 0) {
            pendingExplanation.push(line);
        }
    }

    finalizeCurrent();
    return questions;
}
