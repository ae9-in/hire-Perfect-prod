import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

function getJwtSecret(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET is not configured');
    }
    return secret;
}

export interface TokenPayload {
    userId: string;
    email: string;
    role: string;
}

// Generate JWT token
export function generateToken(payload: TokenPayload): string {
    return jwt.sign(payload, getJwtSecret(), {
        expiresIn: '3d', // Token expires in 3 days
    });
}

// Verify JWT token
export function verifyToken(token: string): TokenPayload | null {
    try {
        const decoded = jwt.verify(token, getJwtSecret()) as TokenPayload;
        return decoded;
    } catch (error) {
        return null;
    }
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}

// Compare password
export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
}

// Generate random token for password reset
export function generateResetToken(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
