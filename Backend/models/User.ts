import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
    email: string;
    password?: string;
    name: string;
    role: 'admin' | 'candidate';
    phone?: string;
    provider: 'local' | 'google' | 'github';
    providerId?: string;
    createdAt: Date;
    updatedAt: Date;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
    {
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
        },
        password: {
            type: String,
            required: function (this: any) {
                return !this.provider || this.provider === 'local';
            },
            minlength: [6, 'Password must be at least 6 characters'],
            select: false,
        },
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
        },
        role: {
            type: String,
            enum: ['admin', 'candidate'],
            default: 'candidate',
        },
        phone: {
            type: String,
            trim: true,
        },
        provider: {
            type: String,
            default: 'local',
        },
        providerId: {
            type: String,
            index: true,
        },
        resetPasswordToken: String,
        resetPasswordExpires: Date,
    },
    {
        timestamps: true,
    }
);

// Hash password before saving
UserSchema.pre('save', async function () {
    if (!this.isModified('password') || !this.password) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    try {
        if (!this.password) return false;
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        return false;
    }
};

// Prevent model recompilation in development
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
