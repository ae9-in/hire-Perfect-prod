# Camera & Proctoring Stabilization README

## Purpose
This document explains:
- why the earlier camera/proctoring implementation was unstable,
- what was changed in the pre-assessment and assessment pages,
- and why the current implementation is now working reliably.

It is written as a detailed technical postmortem + implementation guide for future maintenance.

---

## Scope of Changes
The core behavior was implemented/reworked primarily in:
- `app/exam/pre/[id]/page.tsx`
- `app/exam/[attemptId]/page.tsx`
- Existing camera lifecycle helper reused:
  - `lib/cameraManager.ts`

The backend violation endpoint already existed and is used by the client:
- `app/api/violations/log/route.ts`

---

## Problem Summary (What Was Failing Before)

The previous behavior had multiple overlapping issues:

1. Camera initialization race conditions
- `getUserMedia()` + `video.play()` were being triggered while the component lifecycle was still settling.
- On quick state transitions/unmounts, `play()` was interrupted by `pause()` (browser throws `AbortError`).

2. Proctoring lifecycle race conditions
- The MediaPipe detector loop (`detectForVideo`) could run while resources were being replaced/disposed.
- This produced errors around detector usage/cleanup timing.

3. Excessive coupling between proctoring logic and UI lifecycle
- Camera/AI start-up was tightly coupled to render phases and other checks.
- If one subsystem failed briefly, the entire page could surface runtime overlays.

4. Browser + MediaPipe delegate console behavior
- MediaPipe / TFLite logs CPU delegate info:
  - `INFO: Created TensorFlow Lite XNNPACK delegate for CPU.`
- In this environment, that surfaced through Next.js dev overlay as a console error path.
- This looked like a hard runtime failure even when camera/detection could continue.

5. Inconsistent route/params handling across rewrites
- Earlier revisions mixed old/new parameter access patterns while refactoring.
- This increased chance of undefined behavior during mount.

---

## Root Causes in Detail

### A) `play()` interruption (`AbortError`)
Why it happened:
- Browser camera streams are async.
- If cleanup or a second init happens before initial `video.play()` resolves, browser interrupts the pending play request.
- This is common in dev/hot-reload or strict lifecycle conditions.

Fix applied:
- Wrapped `video.play()` in guarded try/catch.
- Treated `AbortError` as a transient race, then retried once after short delay.
- Avoided failing the full camera setup on this benign case.

### B) Detector frame loop running during teardown/init
Why it happened:
- `requestAnimationFrame` loop can continue while references are being reset.
- Without strict guards, one frame executes against stale or not-ready detector/video state.

Fix applied:
- Added explicit proctoring state refs:
  - `isProctoringActiveRef`
  - `isInitializingProctoringRef`
  - `isDetectingRef`
- `detectFrame` exits early unless all required runtime conditions are valid.
- Added video readiness checks:
  - `readyState >= 2`
  - `videoWidth/videoHeight > 0`
  - skip duplicate time frames.
- Cleanup now first disables loop activity and clears refs.

### C) MediaPipe delegate console noise triggering runtime overlay
Why it happened:
- Delegate info log is not a functional crash by itself.
- In this runtime, it appeared through an error channel that Next overlay reports as console error.

Fix applied:
- Added a route-scoped `console.error` filter only for this exam session.
- Suppresses exactly the known benign XNNPACK delegate message.
- Restores original `console.error` on unmount.

### D) Fullscreen and strict exam controls missing/unstable
User requirements included:
- force fullscreen at assessment start,
- terminate on fullscreen exit,
- warn on right-click and copy/paste shortcuts.

Fix applied:
- Fullscreen requested at exam mount.
- `fullscreenchange` listener terminates session on exit and logs critical violation.
- `contextmenu` prevented; warning shown.
- `Ctrl/Cmd + C` and `Ctrl/Cmd + V` intercepted; warning shown.

---

## Current Working Architecture

## 1) Pre-Assessment Page (`app/exam/pre/[id]/page.tsx`)
Responsibilities:
- Create/start attempt (`/api/assessments/:id/start`).
- Get camera permission and show live preview.
- Require consent checkbox.
- Gate entry to exam until camera is ready.

Stability points:
- Uses cached stream via `CameraManager.getStream()` when available.
- Uses a clean `initCamera` path with explicit status states:
  - `idle` -> `requesting` -> `ready` or `error`.
- Avoids hard fail from transient camera timing.

## 2) Assessment Page (`app/exam/[attemptId]/page.tsx`)
Responsibilities:
- Load attempt/questions/time.
- Keep camera visible.
- Run MediaPipe face monitoring loop.
- Track and log violations.
- Enforce exam behavior policies.

Implemented proctoring features:
- Real-time webcam monitoring
- Face detection (MediaPipe FaceLandmarker)
- Eye/head orientation checks (yaw approximation from eye+nose landmarks)
- Head movement checks (nose displacement between frames)
- Multiple face detection
- Tab switch detection (`visibilitychange`, `blur`)
- Screen minimize/resize detection
- Violation warnings to user
- Auto-termination at `EXAM_CONFIG.MAX_VIOLATIONS` (5)

Policy controls:
- Fullscreen enforced from start
- Exit fullscreen -> terminate
- Right click -> warning
- Copy/paste shortcut -> warning

---

## Why It Is Working Now

The implementation is stable now because it addresses lifecycle order explicitly:

1. Deterministic startup sequence
- Load attempt + init camera + request fullscreen.
- Start detector only after camera and video frame readiness.

2. Deterministic teardown sequence
- Stop animation loop first.
- Disable proctoring flags.
- Null critical refs.
- Release camera stream via `CameraManager.stop()`.

3. Guarded frame processing
- No detection until video has actual frames and dimensions.
- No re-entrant detection while prior inference is running.
- Controlled error handling for transient detector states.

4. Benign-message suppression
- Known non-fatal delegate message is filtered for this route session.
- Avoids false-positive runtime overlay interruptions during exam flow.

5. Feature-specific event handlers
- Each security rule has a dedicated listener and warning/violation behavior.
- Cleanup removes all listeners cleanly on unmount.

---

## Violation System Behavior

Client-side:
- Increments local violation counter immediately for user feedback.
- Shows warning banner.
- Sends violation to backend endpoint with type/severity/description.

Backend (`/api/violations/log`):
- Persists violation entry.
- Increments attempt violation count.
- Terminates attempt when:
  - count reaches `EXAM_CONFIG.MAX_VIOLATIONS`, or
  - critical conditions apply (depending on payload).

Termination UX:
- Client transitions to termination state screen.
- Camera/proctoring cleanup runs.
- User can return to dashboard.

---

## Known Tradeoffs / Notes

1. Dev vs Production behavior
- Next.js dev overlay is stricter/noisier for console errors.
- Some issues reported were dev-overlay artifacts rather than fatal runtime failures.

2. Console filter scope
- Filter is intentionally scoped to exam-page mount/unmount lifecycle.
- It suppresses only the known delegate info message.

3. Fullscreen policy
- Browser may require user gesture for fullscreen in some conditions.
- If blocked, warning is shown; exit from fullscreen during session still terminates.

4. Landmark heuristics
- Eye/head checks are heuristic thresholds, not biometric certainty.
- Threshold tuning may still be adjusted based on real-user data.

---

## Test Checklist (Manual)

Pre-assessment:
- Camera permission prompt appears.
- Live preview visible after allow.
- Start button disabled until camera ready + consent checked.

Assessment:
- Enters fullscreen on start.
- Camera preview visible in right panel.
- Face monitor state shows active.
- Tab switch triggers violation/warning.
- Resize below threshold triggers violation.
- Right-click shows warning.
- Ctrl/Cmd+C and Ctrl/Cmd+V show warning.
- Exiting fullscreen terminates assessment.
- At 5 violations assessment auto-terminates.

---

## Future Improvements

1. Move detector/worklet to Web Worker
- Reduce main-thread jitter and UI coupling.

2. Add adaptive threshold profiles
- Device/browser-specific tolerance for low-end webcams.

3. Add explicit camera health diagnostics
- FPS, frame dimension, permission state telemetry panel.

4. Add structured error telemetry
- Separate benign/expected detector states from actionable failures in logs.

5. Add integration tests for lifecycle
- Simulate mount/unmount and permission-denied scenarios.

---

## Quick Reference

Primary client files:
- `app/exam/pre/[id]/page.tsx`
- `app/exam/[attemptId]/page.tsx`

Server-side logging:
- `app/api/violations/log/route.ts`

Shared config:
- `Backend/lib/constants.ts`

Camera utility:
- `lib/cameraManager.ts`

