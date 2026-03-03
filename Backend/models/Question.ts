import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IQuestion extends Document {
    _id: mongoose.Types.ObjectId;
    assessment: mongoose.Types.ObjectId;
    type: 'mcq' | 'scenario' | 'coding';
    question: string;
    options?: string[]; // For MCQ
    correctAnswer: string | number; // Index for MCQ, code for coding
    explanation?: string;
    points: number;
    difficulty: 'easy' | 'medium' | 'hard';
    tags: string[];
    codeTemplate?: string; // For coding questions
    testCases?: Array<{ input: string; output: string }>; // For coding questions
    normalizedQuestion: string;
    createdAt: Date;
    updatedAt: Date;
}

function normalizeQuestionText(value: string): string {
    return value.trim().replace(/\s+/g, ' ').toLowerCase();
}

const QuestionSchema = new Schema<IQuestion>(
    {
        assessment: {
            type: Schema.Types.ObjectId,
            ref: 'Assessment',
            required: [true, 'Assessment reference is required'],
        },
        type: {
            type: String,
            enum: ['mcq', 'scenario', 'coding'],
            required: [true, 'Question type is required'],
        },
        question: {
            type: String,
            required: [true, 'Question text is required'],
            trim: true,
        },
        options: {
            type: [String],
            validate: {
                validator: function (this: IQuestion, v: string[]) {
                    if (this.type === 'mcq') {
                        return Array.isArray(v) && v.length === 4 && v.every((option) => typeof option === 'string' && option.trim().length > 0);
                    }
                    return true;
                },
                message: 'MCQ questions must have exactly 4 non-empty options',
            },
        },
        correctAnswer: {
            type: Schema.Types.Mixed,
            required: [true, 'Correct answer is required'],
            validate: {
                validator: function (this: any, value: unknown) {
                    const doc = this as IQuestion;

                    if (doc.type === 'mcq') {
                        const numericValue = Number(value);
                        return Number.isInteger(numericValue) && numericValue >= 0 && numericValue <= 3;
                    }

                    if (doc.type === 'scenario') {
                        return typeof value === 'string' && value.trim().length > 0;
                    }

                    return true;
                },
                message: 'Invalid correctAnswer for question type',
            },
        },
        explanation: {
            type: String,
        },
        points: {
            type: Number,
            default: 1,
        },
        difficulty: {
            type: String,
            enum: ['easy', 'medium', 'hard'],
            default: 'medium',
        },
        tags: [String],
        codeTemplate: {
            type: String,
        },
        testCases: [
            {
                input: String,
                output: String,
            },
        ],
        normalizedQuestion: {
            type: String,
            required: true,
            select: false,
            default: function (this: IQuestion) {
                return normalizeQuestionText(this.question || '');
            },
        },
    },
    {
        timestamps: true,
    }
);

// Index for faster queries
QuestionSchema.index({ assessment: 1 });
QuestionSchema.index({ assessment: 1, difficulty: 1 });
QuestionSchema.index({ assessment: 1, normalizedQuestion: 1 }, { unique: true });

QuestionSchema.pre('validate', function (this: any) {
    this.question = this.question?.trim();
    this.normalizedQuestion = normalizeQuestionText(this.question || '');

    if (Array.isArray(this.options)) {
        this.options = this.options.map((option: string) => option.trim());
    }

    if (this.type === 'mcq') {
        this.correctAnswer = Number(this.correctAnswer);
    }
});

const Question: Model<IQuestion> = mongoose.models.Question || mongoose.model<IQuestion>('Question', QuestionSchema);

export default Question;

