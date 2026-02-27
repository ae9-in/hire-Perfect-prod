import mongoose, { Schema, Document, Model } from 'mongoose';
import { Types } from "mongoose";

export interface ICategory extends Document {
    _id: Types.ObjectId;
    name: string;
    slug: string;
    description: string;
    subjects: string[];
    icon?: string;
    order: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
    {
        name: {
            type: String,
            required: [true, 'Category name is required'],
            unique: true,
            trim: true,
        },
        slug: {
            type: String,
            required: [true, 'Category slug is required'],
            unique: true,
            lowercase: true,
            trim: true,
        },
        description: {
            type: String,
            required: [true, 'Category description is required'],
        },
        subjects: {
            type: [String],
            default: [],
        },
        icon: {
            type: String,
        },
        order: {
            type: Number,
            default: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

const Category: Model<ICategory> = mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);

export default Category;
