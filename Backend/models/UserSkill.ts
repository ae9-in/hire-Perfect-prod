import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUserSkill extends Document {
    userId: mongoose.Types.ObjectId;
    skillId: mongoose.Types.ObjectId;
    rating: number; // 1-10
    notes: string;
    assignedBy: mongoose.Types.ObjectId; // admin who assigned
    createdAt: Date;
    updatedAt: Date;
}

const UserSkillSchema = new Schema<IUserSkill>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        skillId: { type: Schema.Types.ObjectId, ref: 'Skill', required: true },
        rating: { type: Number, required: true, min: 1, max: 10 },
        notes: { type: String, default: '' },
        assignedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    },
    { timestamps: true }
);

// A user can have a unique skill rating per skill
UserSkillSchema.index({ userId: 1, skillId: 1 }, { unique: true });
UserSkillSchema.index({ userId: 1 });

const UserSkill: Model<IUserSkill> =
    mongoose.models.UserSkill || mongoose.model<IUserSkill>('UserSkill', UserSkillSchema);

export default UserSkill;
