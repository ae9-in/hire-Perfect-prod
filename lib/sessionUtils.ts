/**
 * Session utility helpers for client-side 3-day expiration enforcement.
 *
 * How it works:
 *  - On every login / signup, call storeLoginTimestamp() to record the moment.
 *  - On every protected page mount, call checkAndClearExpiredSession(router).
 *    If the stored timestamp is older than SESSION_DURATION_MS, or the token
 *    is missing, localStorage is cleared and the user is redirected to /login.
 */

import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

/** How long (in ms) a session stays valid without re-login. */
const SESSION_DURATION_MS = 3 * 24 * 60 * 60 * 1000; // 3 days

/**
 * Persist the current timestamp as the "last login" moment.
 * Call this immediately after saving token + user to localStorage.
 */
export function storeLoginTimestamp(): void {
    if (typeof window !== 'undefined') {
        localStorage.setItem('loginAt', Date.now().toString());
    }
}

/**
 * Check whether the current session has expired.
 * If it has (or there is no token), clears all auth keys from localStorage
 * and pushes the user to /login.
 *
 * @param router - The Next.js router instance from useRouter()
 * @returns true  if the session is still valid (caller can proceed)
 *          false if the session has expired (caller should stop; redirect in progress)
 */
export function checkAndClearExpiredSession(router: AppRouterInstance): boolean {
    if (typeof window === 'undefined') {
        // SSR — skip check, always return true so the page can attempt to render.
        return true;
    }

    const token = localStorage.getItem('token');
    const loginAtRaw = localStorage.getItem('loginAt');

    // No token at all → not logged in
    if (!token) {
        return false;
    }

    if (loginAtRaw) {
        const loginAt = parseInt(loginAtRaw, 10);
        const elapsed = Date.now() - loginAt;

        if (elapsed > SESSION_DURATION_MS) {
            // Session older than 3 days — force logout
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('loginAt');
            router.push('/login');
            return false;
        }
    } else {
        // loginAt key is missing (legacy session) — heal it: store now and allow access.
        localStorage.setItem('loginAt', Date.now().toString());
    }

    return true;
}
