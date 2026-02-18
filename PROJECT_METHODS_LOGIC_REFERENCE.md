# Project Methods and Logic Reference

This document is a future-reference map of:
- what logic exists in this repository,
- which methods/handlers implement that logic,
- which libraries are used,
- where each method lives (file + folder).

## 1) Runtime and Path Rules

- Framework: `Next.js` (App Router) + `React` + `TypeScript`
- DB layer: `Mongoose` (MongoDB) for app data, `Prisma` present for auxiliary use.
- Path aliases from `tsconfig.json`:
  - `@/lib/*` resolves to both `lib/*` and `Backend/lib/*`
  - `@/models/*` resolves to `Backend/models/*`
  - `@/middleware/*` resolves to `middleware/*`

## 2) Library-to-Logic Map

- `next`, `react`, `react-dom`: UI pages/components and API route runtime.
- `mongoose`, `mongodb`: schema models, CRUD queries, aggregations.
- `jsonwebtoken`: custom JWT auth (`generateToken`, `verifyToken`).
- `bcryptjs`: password hashing and comparison.
- `next-auth`: OAuth/session auth (Google/GitHub).
- `@mediapipe/tasks-vision`: face landmark detection for proctoring.
- `@tensorflow/tfjs`: available dependency (not primary active detector in current exam page).
- `razorpay`, `crypto`: payment order creation and signature verification.
- `nodemailer`: email capability (reset flow currently logs link in dev).
- `dotenv`: scripts/runtime env loading.
- `dns-packet` / Node `dns`: DNS/network behavior support in DB connectivity flow.

## 3) Core Shared Libraries (Methods + Logic)

### `Backend/lib/auth.ts`
- `generateToken(payload)`: creates 7-day JWT.
- `verifyToken(token)`: verifies JWT, returns payload or `null`.
- `hashPassword(password)`: bcrypt hash helper.
- `comparePassword(password, hashedPassword)`: bcrypt verify helper.
- `generateResetToken()`: random token generation for password reset.
- Libraries: `jsonwebtoken`, `bcryptjs`.

### `middleware/auth.ts`
- `authMiddleware(request)`: dual auth check:
  - Bearer JWT from `Authorization` header
  - NextAuth JWT session via `getToken`
- `adminMiddleware(request)`: wraps `authMiddleware`, enforces admin role.
- `getUserFromRequest(request)`: utility to fetch decoded user context.
- Libraries: `next/server`, `next-auth/jwt`, custom auth lib.

### `Backend/lib/db.ts`
- `connectDB()`: cached singleton Mongoose connection.
- Pre-registers models to avoid `MissingSchemaError` on `populate`.
- Forces IPv4-first DNS and uses robust connection options.
- Libraries: `mongoose`, Node `dns`.

### `Backend/lib/razorpay.ts`
- `createOrder(params)`: creates Razorpay order.
- `verifyPaymentSignature(orderId, paymentId, signature)`: HMAC SHA256 validation.
- `getPaymentDetails(paymentId)`: fetch payment details from Razorpay.
- Libraries: `razorpay`, Node `crypto`.

### `lib/cameraManager.ts` and `Backend/lib/cameraManager.ts`
- `CameraManager.setStream(stream)`, `getStream()`, `addResource(resource)`, `stop()`.
- Logic: central stream/resource lifecycle manager for camera cleanup and reuse.

### `Backend/lib/auth-options.ts`
- `authOptions` for NextAuth:
  - Google/GitHub providers
  - user provisioning/linking
  - JWT/session callbacks
- Libraries: `next-auth`, provider SDKs, `mongoose` models.

### `Backend/lib/constants.ts`
- Domain constants:
  - pricing, exam config, violation types/severity, roles, statuses, categories.

## 4) Data Models (Schemas + Hooks + Indexing)

### `Backend/models/User.ts`
- Logic:
  - schema for local/social users,
  - pre-save password hashing hook,
  - instance method `comparePassword`.
- Libraries: `mongoose`, `bcryptjs`.

### `Backend/models/Assessment.ts`
- Assessment metadata schema, category relation, indexes on category/slug.
- Libraries: `mongoose`.

### `Backend/models/Question.ts`
- Multi-type question schema (`mcq`, `scenario`, `coding`).
- Validation logic: MCQ requires options length >= 2.
- Libraries: `mongoose`.

### `Backend/models/Attempt.ts`
- Stores randomized question set, answers, scoring, timing, violation references.
- Libraries: `mongoose`.

### `Backend/models/Violation.ts`
- Violation event schema with severity/type + metadata.
- Libraries: `mongoose`.

### `Backend/models/Purchase.ts`
- Purchase/access entitlement schema and payment status.
- Libraries: `mongoose`.

### `Backend/models/Transaction.ts`
- Razorpay transaction lifecycle schema.
- Libraries: `mongoose`.

### `Backend/models/Category.ts`
- Category schema (ordering/active flags).
- Libraries: `mongoose`.

### `Backend/models/AuditLog.ts`
- Admin/system log schema + TTL index (30-day auto-expiry).
- Libraries: `mongoose`.

## 5) API Routes (File, Method, Logic, Libraries)

### Authentication
- `app/api/auth/signup/route.ts`
  - `POST`: validate signup, optional admin secret check, create user, return JWT.
  - Uses: `connectDB`, `User`, `generateToken`.
- `app/api/auth/login/route.ts`
  - `POST`: verify credentials, return JWT + profile.
  - Uses: `User.comparePassword`, `generateToken`.
- `app/api/auth/forgot-password/route.ts`
  - `POST`: create reset token + expiry, log/reset link flow.
  - Uses: `generateResetToken`, `User`.
- `app/api/auth/reset-password/route.ts`
  - `POST`: validate token/expiry, set new password.
  - Uses: `User` model pre-save password hashing.
- `app/api/auth/[...nextauth]/route.ts`
  - `GET`, `POST`: NextAuth handler proxy.
  - Uses: `authOptions`.

### Assessments and Attempts
- `app/api/assessments/route.ts`
  - `GET`: list active assessments + user-access evaluation (testing bypass present).
  - Uses: `authMiddleware`, `Assessment`, `Purchase`.
- `app/api/assessments/[id]/start/route.ts`
  - `POST`: authorize user, recover or create attempt, randomize questions.
  - Uses: `authMiddleware`, `Assessment`, `Question`, `Attempt`, `Purchase`.
- `app/api/assessments/[id]/submit/route.ts`
  - `POST`: grade answers, compute score/percentage/time, finalize attempt.
  - Uses: `authMiddleware`, `Attempt`, `Question`.
- `app/api/attempts/route.ts`
  - `GET`: list authenticated user attempts.
- `app/api/attempts/[id]/route.ts`
  - `GET`: fetch attempt details, verify ownership, load randomized ordered questions, compute time left.

### Proctoring / Violations
- `app/api/violations/log/route.ts`
  - `POST`: persist violation, increment attempt counter, terminate on threshold/critical.
  - Uses: `authMiddleware`, `Violation`, `Attempt`, `EXAM_CONFIG`.

### Payments
- `app/api/payment/create-order/route.ts`
  - `POST`: create pending purchase + Razorpay order + transaction record.
  - Uses: `authMiddleware`, `createOrder`, `Purchase`, `Transaction`, `PRICING`.
- `app/api/payment/verify/route.ts`
  - `POST`: verify signature, mark transaction captured, complete purchase.
  - Uses: `verifyPaymentSignature`, `Transaction`, `Purchase`.
- `app/api/payment/purchases/route.ts`
  - `GET`: list authenticated user completed purchases.

### Admin APIs
- `app/api/admin/users/route.ts`
  - `GET`: search/filter users.
  - `PATCH`: update user fields.
  - `DELETE`: delete user (self-delete blocked).
- `app/api/admin/assessments/route.ts`
  - `GET`, `POST`, `PATCH`, `DELETE`: assessment CRUD.
- `app/api/admin/questions/route.ts`
  - `GET`, `POST`, `PATCH`, `DELETE`: question CRUD + updates `Assessment.totalQuestions`.
- `app/api/admin/categories/route.ts`
  - `GET`, `POST`: category listing/creation.
- `app/api/admin/attempts/route.ts`
  - `GET`: recent attempts with user+assessment context.
- `app/api/admin/stats/route.ts`
  - `GET`: aggregated platform stats (attempts, revenue, avg score, violations).
- `app/api/admin/logs/route.ts`
  - `GET`: audit log feed (with seed logs fallback).
  - `createLog(data)`: utility for writing audit logs.

### Maintenance / Debug
- `app/api/maintenance/seed/route.ts`
  - `GET`: destructive reseed of categories/assessments/questions.
- `app/api/debug/assessments/route.ts`
  - `GET`: quick counts/sample diagnostics.

## 6) Frontend Pages and Main Methods

### Exam and Proctoring
- `app/exam/pre/[id]/page.tsx`
  - `loadAssessment()`: starts/retrieves attempt bootstrap.
  - `initCamera()`: permission + stream init.
  - `attachVideo(stream)`: bind stream to preview element.
  - `handleStart()`: route to live exam.
  - Libraries: React hooks, Web Media APIs.

- `app/exam/[attemptId]/page.tsx`
  - `loadExam()`: fetch attempt/questions/time.
  - `initCamera()`, `attachStreamToVideo()`: camera stream setup.
  - `initializeProctoring()`: MediaPipe model setup.
  - `detectFrame()`: AI loop (landmarks -> rule checks -> violation decisions).
  - `logViolation()`: client-side warning + backend persistence.
  - `cleanupProctoring()`: shutdown/reset of loop and refs.
  - `enterFullscreen()`: enforce full-screen exam mode.
  - `submitAssessment(autoSubmit)`: finalize submission.
  - Event policies: tab switch, blur, resize, context menu, copy/paste, fullscreen exit.
  - Live diagnostics: AI FPS, face count, engine state.
  - Libraries: `@mediapipe/tasks-vision`, browser media/fullscreen APIs, React hooks.

### Candidate Pages
- `app/assessments/page.tsx`
  - `loadData()`: fetch assessments + purchases for access UI.
- `app/dashboard/page.tsx`
  - `loadData()`, `loadAssessments()`, `loadAttempts()`: candidate dashboard aggregates.
- `app/results/[attemptId]/page.tsx`
  - `loadResult()`: fetch completed attempt and render results.
- `app/login/page.tsx`
  - `handleSubmit()`: login flow and token/session storage.
- `app/signup/page.tsx`
  - `handleSubmit()`: signup flow and token/session storage.

### Admin Pages
- `app/admin/dashboard/page.tsx`
  - `loadData()`, `fetchLogs()`: stats + audit feed.
- `app/admin/users/page.tsx`
  - `fetchUsers()`, `handleUpdateUser()`, `handleDeleteUser()`.
- `app/admin/assessments/page.tsx`
  - `fetchData()`, `handleSubmit()`, `handleDelete()`.
- `app/admin/assessments/[id]/questions/page.tsx`
  - `fetchData()`, `handleSubmit()`, `handleDelete()`.

### Static/Informational Pages
- `app/page.tsx`, `app/about/page.tsx`, `app/privacy/page.tsx`, `app/terms/page.tsx`, `app/layout.tsx`.
- Logic: presentation/layout plus global camera sentinel mount (`CameraSentinel`).

## 7) Components (Methods and UI Logic)

### Global Logic Component
- `components/CameraSentinel.tsx`
  - `useEffect` route watcher:
    - if path is outside `/exam`, force `CameraManager.stop()`.

### Shared UI Components
- `components/ui/Navbar.tsx`
  - local user/session read, logout flow (`CameraManager.stop()` on logout).
- `components/ui/Modal.tsx`
  - mount state + escape/outside-close behavior.
- `components/ui/Input.tsx`, `Button.tsx`, `Card.tsx`, `Badge.tsx`, `Loading.tsx`, `CriticalError.tsx`, `CertificateModal.tsx`
  - UI rendering logic, validation/error states, and display helpers.

## 8) Scripts and Utilities (Maintenance/Diagnostics)

### Seed/Setup
- `Backend/scripts/seed.ts`
  - `seed()`, `generateQuestions()`: full DB seed (categories/assessments/questions).

### DB Checks and Diagnostics
- `Backend/scripts/check-db.ts`
  - `checkDb()`: connection + database/collection listing.
- `Backend/scripts/test-atlas.ts`
  - `testConnection()`: Atlas connectivity diagnostic.
- `Backend/scripts/debug-questions.ts`
  - `debugQuestions()`: question-type/answer distribution.

### Data Normalization / Forced Updates
- `Backend/scripts/fix-all-questions.ts` -> `fixAll()`: force `correctAnswer = 0` globally.
- `Backend/scripts/update-answers.ts` -> `updateAnswers()`: normalize MCQ/scenario answers.
- `Backend/scripts/force-option-one.ts` -> `forceOptionOne()`: force option-1 correctness.
- `Backend/scripts/verify-seed.ts` -> `verify()`: quick seeded-count verification.

### Additional JS diagnostics
- `Backend/scripts/debug-db.js`, `quick-verify.js`, `verify-db-v2.js`, `verify-write.js`
  - operational checks and environment-specific debugging.
- `Backend/check-users.ts`, `Backend/check-users.js`
  - direct user-record inspection utilities.

## 9) Practical Notes for Future Maintainers

- `@/lib/*` alias can resolve to either `lib/*` or `Backend/lib/*`; check import resolution carefully.
- Some assessment access/scoring paths contain explicit testing bypasses/hard-coded test behavior.
- Proctoring behavior is highly threshold-sensitive; tune gradually with real-device tests.
- Keep camera/proctoring lifecycle deterministic:
  - one active detection loop,
  - guarded reinitialization,
  - explicit cleanup on route exit/submission/termination.
