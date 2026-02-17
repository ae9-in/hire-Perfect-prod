import NextAuth from 'next-auth';
import { authOptions } from '@/Backend/lib/auth-options';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
