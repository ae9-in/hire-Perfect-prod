# Camera AI Detection Guide

This guide explains how camera-based AI detection works during an assessment.

## What This System Does

- Starts webcam preview for the candidate.
- Runs face-landmark inference in real time using MediaPipe FaceLandmarker.
- Monitors behavior signals and logs violations.
- Shows live AI health in the exam UI.
- Terminates the assessment when max violations are reached.

## Where It Runs

- Main implementation: `app/exam/[attemptId]/page.tsx`
- Violation logging API: `app/api/violations/log/route.ts`
- Shared violation constants: `Backend/lib/constants.ts`
- Camera stream manager: `lib/cameraManager.ts`

## Startup Flow

1. Exam page loads attempt data.
2. Camera initializes via `getUserMedia`.
3. Stream is attached to the `<video>` element.
4. FaceLandmarker model is loaded (GPU first, CPU fallback).
5. Proctoring loop starts with `requestAnimationFrame`.
6. Warmup/calibration period runs to reduce false positives.

## Detection Loop

Each loop iteration:

1. Checks video readiness and frame timing.
2. Runs `detectForVideo(...)`.
3. Reads face landmarks.
4. Computes behavior signals.
5. Applies streak checks and cooldowns.
6. Emits at most one prioritized violation per frame.

## Signals Monitored

- `FACE_NOT_DETECTED`: no face visible.
- `MULTIPLE_FACES`: more than one face visible.
- `LOOKING_AWAY`: head orientation deviates from baseline.
- `SUDDEN_MOVEMENT`: nose landmark displacement jumps sharply.
- `GAZE_DEVIATION`: iris offset deviates from baseline.
- `TAB_SWITCH`: visibility/focus loss.
- `SCREEN_MINIMIZE`: aggressive resize or minimized-like viewport.
- `FULLSCREEN_EXIT`: user exits fullscreen.

## Calibration and Stability Controls

- Warmup window at startup to avoid instant false warnings.
- Baseline capture for yaw, pitch, and gaze during warmup.
- Consecutive-frame streak requirement before warning.
- Per-rule cooldown to prevent warning spam.
- Watchdog restarts detector if inference stalls.

## UI Status Indicators

In the camera card:

- `Engine`: `RUN` or `INIT`.
- `Faces`: latest detected face count.
- `AI FPS`: detection cycles per second.

Important:
- `AI FPS` is AI inference throughput, not raw camera sensor FPS.

## Violation Lifecycle

1. Client detects suspicious event.
2. Client updates local warning state and counter.
3. Client posts violation to `/api/violations/log`.
4. Server persists violation and increments attempt count.
5. Attempt is terminated when threshold/critical condition is met.

## Common Reasons for False Positives

- Camera angle too low/high relative to face center.
- Poor lighting or backlight.
- Candidate too close to camera.
- Unstable laptop movement or shaking.
- Aggressive threshold tuning without adequate warmup.

## Recommended Test Procedure

1. Start assessment and remain still for 10 seconds.
2. Verify `Engine = RUN` and `AI FPS > 0`.
3. Turn head away for 1-2 seconds and confirm warning.
4. Move eyes strongly left/right and confirm warning.
5. Cover lens briefly and confirm face/lens warning.
6. Return to neutral posture and confirm warnings do not spam.

## Tuning Guidance

If detection is too strict:

- Increase threshold values.
- Increase streak requirement.
- Increase cooldown per rule.
- Extend warmup/calibration duration.

If detection is too weak:

- Lower threshold values.
- Decrease streak requirement.
- Reduce cooldown per rule.
- Increase detection cadence carefully.

## Notes for Developers

- Keep one RAF scheduling point per loop cycle to avoid duplicate loops.
- Avoid logging multiple violations from the same frame.
- Reset streaks and baselines on reinit and cleanup.
- Prefer incremental tuning with real-device tests after each change.
