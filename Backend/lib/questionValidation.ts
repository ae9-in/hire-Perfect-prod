import mongoose from 'mongoose';

export type QuestionType = 'mcq' | 'scenario' | 'coding';
export type QuestionDifficulty = 'easy' | 'medium' | 'hard';

export type QuestionPayload = {
    assessmentId?: string;
    type?: QuestionType;
    question?: string;
    options?: string[];
    correctAnswer?: string | number;
    explanation?: string;
    points?: number;
    difficulty?: QuestionDifficulty;
    tags?: string[];
    codeTemplate?: string;
    testCases?: Array<{ input: string; output: string }>;
};

export type NormalizedQuestionPayload = {
    assessmentId?: string;
    type: QuestionType;
    question: string;
    normalizedQuestion: string;
    options: string[];
    correctAnswer: string | number;
    explanation: string;
    points: number;
    difficulty: QuestionDifficulty;
    tags: string[];
    codeTemplate?: string;
    testCases?: Array<{ input: string; output: string }>;
};

export function normalizeQuestionText(value: string): string {
    return value.trim().replace(/\s+/g, ' ').toLowerCase();
}

export function isValidObjectId(value: string): boolean {
    return mongoose.Types.ObjectId.isValid(value);
}

export function validateQuestionPayload(payload: QuestionPayload): { value?: NormalizedQuestionPayload; errors: string[] } {
    const errors: string[] = [];
    const type = payload.type ?? 'mcq';
    const question = (payload.question || '').trim();
    const normalizedQuestion = normalizeQuestionText(question);
    const options = (payload.options || []).map((option) => option.trim());
    const explanation = (payload.explanation || '').trim();
    const tags = (payload.tags || []).map((tag) => tag.trim()).filter(Boolean);
    const points = typeof payload.points === 'number' ? payload.points : Number(payload.points ?? 1);
    const difficulty = payload.difficulty ?? 'medium';
    let correctAnswer: string | number = payload.correctAnswer ?? 0;

    if (!['mcq', 'scenario', 'coding'].includes(type)) {
        errors.push('Invalid question type');
    }

    if (!question) {
        errors.push('Question text is required');
    }

    if (!['easy', 'medium', 'hard'].includes(difficulty)) {
        errors.push('Difficulty must be easy, medium, or hard');
    }

    if (!Number.isFinite(points) || points <= 0) {
        errors.push('Points must be a positive number');
    }

    if (type === 'mcq') {
        if (options.length !== 4 || options.some((option) => option.length === 0)) {
            errors.push('MCQ questions require exactly 4 non-empty options');
        }

        const parsedCorrectAnswer = Number(correctAnswer);
        if (!Number.isInteger(parsedCorrectAnswer) || parsedCorrectAnswer < 0 || parsedCorrectAnswer > 3) {
            errors.push('MCQ correctAnswer must be an integer from 0 to 3');
        }
        correctAnswer = parsedCorrectAnswer;
    }

    if (type === 'scenario') {
        if (typeof correctAnswer !== 'string' || correctAnswer.trim().length === 0) {
            errors.push('Scenario correctAnswer must be a non-empty string');
        } else {
            correctAnswer = correctAnswer.trim();
        }
    }

    if (errors.length > 0) {
        return { errors };
    }

    return {
        errors,
        value: {
            assessmentId: payload.assessmentId,
            type,
            question,
            normalizedQuestion,
            options: type === 'mcq' ? options : [],
            correctAnswer,
            explanation,
            points,
            difficulty,
            tags,
            codeTemplate: payload.codeTemplate,
            testCases: payload.testCases,
        },
    };
}
