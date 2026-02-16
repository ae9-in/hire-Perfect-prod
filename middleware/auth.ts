import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, TokenPayload } from '@/lib/auth';

export interface AuthRequest extends NextRequest {
    user?: TokenPayload;
}

// Middleware to verify authentication
export async function authMiddleware(request: NextRequest): Promise<{ authorized: boolean; user?: TokenPayload; response?: NextResponse }> {
    try {
        const authHeader = request.headers.get('authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return {
                authorized: false,
                response: NextResponse.json(
                    { error: 'Unauthorized - No token provided' },
                    { status: 401 }
                ),
            };
        }

        const token = authHeader.substring(7);
        const decoded = verifyToken(token);

        if (!decoded) {
            return {
                authorized: false,
                response: NextResponse.json(
                    { error: 'Unauthorized - Invalid token' },
                    { status: 401 }
                ),
            };
        }

        return {
            authorized: true,
            user: decoded,
        };
    } catch (error) {
        return {
            authorized: false,
            response: NextResponse.json(
                { error: 'Unauthorized - Token verification failed' },
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
