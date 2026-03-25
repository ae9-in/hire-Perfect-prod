import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISkill extends Document {
    name: string;
    category: 'frontend' | 'backend' | 'database' | 'devops' | 'dsa' | 'other';
    isActive: boolean;
    createdAt: Date;
}

const SkillSchema = new Schema<ISkill>(
    {
        name: { type: String, required: true, unique: true, trim: true },
        category: {
            type: String,
            enum: ['frontend', 'backend', 'database', 'devops', 'dsa', 'other'],
            default: 'other',
        },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

SkillSchema.index({ name: 1 });
SkillSchema.index({ category: 1, isActive: 1 });

const Skill: Model<ISkill> =
    mongoose.models.Skill || mongoose.model<ISkill>('Skill', SkillSchema);

export default Skill;
