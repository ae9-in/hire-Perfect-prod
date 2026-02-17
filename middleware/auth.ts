import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, TokenPayload } from '@/lib/auth';
import { getToken } from 'next-auth/jwt';

export interface AuthRequest extends NextRequest {
    user?: TokenPayload;
}

// Middleware to verify authentication
export async function authMiddleware(request: NextRequest): Promise<{ authorized: boolean; user?: TokenPayload; response?: NextResponse }> {
    try {
        // 1. Check for manual JWT in Authorization header
        const authHeader = request.headers.get('authorization');

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const decoded = verifyToken(token);

            if (decoded) {
                return {
                    authorized: true,
                    user: decoded,
                };
            }
        }

        // 2. Check for NextAuth session (OAuth)
        const nextAuthToken = await getToken({
            req: request,
            secret: process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET,
        });

        if (nextAuthToken) {
            return {
                authorized: true,
                user: {
                    userId: nextAuthToken.userId as string,
                    email: (nextAuthToken.email as string) || '',
                    role: (nextAuthToken.role as string) || 'candidate',
                },
            };
        }

        return {
            authorized: false,
            response: NextResponse.json(
                { error: 'Unauthorized - No valid session or token provided' },
                { status: 401 }
            ),
        };
    } catch (error) {
        console.error('Middleware auth error:', error);
        return {
            authorized: false,
            response: NextResponse.json(
                { error: 'Unauthorized - Auth verification failed' },
                { status: 401 }
            ),
        };
    }
}

// Middleware to verify admin role
export async function adminMiddleware(request: NextRequest): Promise<{ authorized: boolean; user?: TokenPayload; response?: NextResponse }> {
    const authResult = await authMiddleware(request);

    if (!authResult.authorized) {
        return authResult;
    }

    if (authResult.user?.role !== 'admin') {
        return {
            authorized: false,
            response: NextResponse.json(
                { error: 'Forbidden - Admin access required' },
                { status: 403 }
            ),
        };
    }

    return authResult;
}

// Helper to get user from request
export async function getUserFromRequest(request: NextRequest): Promise<TokenPayload | null> {
    const authResult = await authMiddleware(request);
    return authResult.user || null;
}
