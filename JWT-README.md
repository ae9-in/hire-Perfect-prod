# JSON Web Token (JWT) Implementation Guide

This document explains how JWT (JSON Web Tokens) are implemented and utilized within the **HirePerfect** project for secure authentication and authorization.

## 🚀 Overview

In this project, JWT is used to maintain user sessions and authorize access to protected API routes. It follows the **Stateless Authentication** pattern, meaning the server doesn't need to store session data in a database for every request.

---

## 📂 Key Files

- **[Backend/lib/auth.ts](file:///w:/V%20S%20Code%20files/hireperfect/Backend/lib/auth.ts)**: Contains core functions for signing (`generateToken`) and verifying (`verifyToken`) tokens.
- **[middleware/auth.ts](file:///w:/V%20S%20Code%20files/hireperfect/middleware/auth.ts)**: Contains middleware functions (`authMiddleware`, `adminMiddleware`) used to protect API routes.
- **[app/api/auth/login/route.ts](file:///w:/V%20S%20Code%20files/hireperfect/app/api/auth/login/route.ts)**: Issues a new JWT upon successful user login.

---

## 🛠️ Implementation Details

### 1. Token Structure (Payload)
The token encodes a JSON object with the following user information:
```json
{
  "userId": "67b074a3832d73f47c944747",
  "email": "user@example.com",
  "role": "candidate", // or "admin"
  "iat": 1739767000,
  "exp": 1740371800
}
```
*   **Expiration**: Tokens are configured to expire in **7 days**.

### 2. Environment Configuration
The system requires a secret key to sign and verify tokens.
```env
JWT_SECRET=your_secure_random_secret_key
```
> [!IMPORTANT]
> Never share your `JWT_SECRET`. If compromised, attackers can forge valid authentication tokens.

---

## 🛡️ How to Protect Routes

### Backend (Next.js API Routes)
To secure an API endpoint, use the `authMiddleware` inside your route handler:

```typescript
import { authMiddleware } from '@/middleware/auth';

export async function GET(request: NextRequest) {
    const authResult = await authMiddleware(request);

    if (!authResult.authorized) {
        return authResult.response; // Returns 401 Unauthorized
    }

    const user = authResult.user; // Access user.userId, user.role, etc.
    // ... logic for authorized users
}
```

### Admin-Only Routes
Use `adminMiddleware` to restrict access to administrators only:

```typescript
const authResult = await adminMiddleware(request);
if (!authResult.authorized) return authResult.response;
```

---

## 💻 Client-Side Usage

When the client receives a token after login/signup, it must be stored (usually in `localStorage` or a secure cookie). 

For every subsequent request to a protected route, the client must include the token in the headers:

**Header Format:**
```http
Authorization: Bearer <your_jwt_token_here>
```

---

## 🔄 Token Lifecycle

1.  **Issue**: User logs in -> Server generates token using `JWT_SECRET`.
2.  **Storage**: Client stores token.
3.  **Exchange**: Client sends token in the `Authorization` header for API calls.
4.  **Verification**: Server extracts token, verifies it against `JWT_SECRET`, and extracts user data.
5.  **Access**: If valid, the request proceeds; if invalid or expired, the server returns `401 Unauthorized`.
