import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import connectDB from './db';
import User from '../models/User';

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        }),
        GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID || '',
            clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
        }),
    ],
    callbacks: {
        async signIn({ user, account }) {
            if (!user.email) return false;

            await connectDB();
            try {
                let dbUser = await User.findOne({ email: user.email.toLowerCase() });

                if (!dbUser) {
                    // Create new user for social login
                    await User.create({
                        email: user.email.toLowerCase(),
                        name: user.name || user.email.split('@')[0],
                        provider: account?.provider || 'unknown',
                        providerId: account?.providerAccountId,
                        role: 'candidate',
                    });
                } else {
                    // Update existing user if they are moving from local to social or linking
                    if (dbUser.provider === 'local') {
                        dbUser.provider = (account?.provider as any) || 'unknown';
                        dbUser.providerId = account?.providerAccountId;
                        await dbUser.save();
                    }
                }
                return true;
            } catch (error) {
                console.error('SignIn callback error:', error);
                return false;
            }
        },
        async jwt({ token, user }) {
            if (user) {
                await connectDB();
                const dbUser = await User.findOne({ email: user.email?.toLowerCase() });
                if (dbUser) {
                    token.userId = dbUser._id.toString();
                    token.role = dbUser.role;
                }
            }
            return token;
        },
        async session({ session, token }: any) {
            if (token && session.user) {
                session.user.id = token.userId;
                session.user.role = token.role;
            }
            return session;
        },
    },
    pages: {
        signIn: '/login',
        error: '/auth/error',
    },
    session: {
        strategy: 'jwt',
        maxAge: 7 * 24 * 60 * 60, // 7 days, matching existing JWT config
    },
    secret: process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET,
};
