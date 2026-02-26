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
    createdAt: Date;
    updatedAt: Date;
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
        },
        options: {
            type: [String],
            validate: {
                validator: function (this: IQuestion, v: string[]) {
                    if (this.type === 'mcq') {
                        return v && v.length >= 2;
                    }
                    return true;
                },
                message: 'MCQ questions must have at least 2 options',
            },
        },
        correctAnswer: {
            type: Schema.Types.Mixed,
            required: [true, 'Correct answer is required'],
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
    },
    {
        timestamps: true,
    }
);

// Index for faster queries
QuestionSchema.index({ assessment: 1 });

const Question: Model<IQuestion> = mongoose.models.Question || mongoose.model<IQuestion>('Question', QuestionSchema);

export default Question;

