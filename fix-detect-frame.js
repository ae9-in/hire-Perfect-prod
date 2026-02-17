const fs = require('fs');
const path = 'w:/V S Code files/hireperfect/app/exam/[attemptId]/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const newDetectFrame = `    const detectFrame = async () => {
        if (!videoRef.current || !faceLandmarker || !proctoringActive) return;

        const timestamp = performance.now();
        if (videoRef.current.currentTime !== lastVideoTimeRef.current) {
            lastVideoTimeRef.current = videoRef.current.currentTime;

            // 1. Face Landmarking & Gaze Tracking
            const faceResult = faceLandmarker.detectForVideo(videoRef.current, timestamp);
            if (faceResult.faceLandmarks) {
                if (faceResult.faceLandmarks.length > 1) {
                    throttlingLogViolation(VIOLATION_TYPES.MULTIPLE_FACES, 'Security Alert: Multiple subjects detected in restricted zone.');
                }
                if (faceResult.faceLandmarks.length === 0) {
                    throttlingLogViolation(VIOLATION_TYPES.FACE_NOT_DETECTED, 'Optic Failure: Primary subject baseline lost.');
                } else if (faceResult.faceLandmarks[0]) {
                    const landmarks = faceResult.faceLandmarks[0];
                    
                    // Sudden Movement Detection
                    const nose = landmarks[1];
                    if (lastNosePosRef.current && nose) {
                        const dist = Math.sqrt(Math.pow(nose.x - lastNosePosRef.current.x, 2) + Math.pow(nose.y - lastNosePosRef.current.y, 2));
                        if (dist > 0.15 && (Date.now() - lastMovementLoggedRef.current > 5000)) {
                            throttlingLogViolation(VIOLATION_TYPES.SUDDEN_MOVEMENT, 'Inertial Alert: Unauthorized sudden kinetic burst.');
                            showWarningModal('Protocol Alert: Sudden movement detected. Maintain focus.');
                            lastMovementLoggedRef.current = Date.now();
                        }
                    }
                    if (nose) lastNosePosRef.current = { x: nose.x, y: nose.y };

                    // Head Pose (Yaw Axis)
                    const headRotation = calculateHeadRotation(landmarks);
                    if (Math.abs(headRotation.y) > 0.35) {
                        throttlingLogViolation(VIOLATION_TYPES.LOOKING_AWAY, 'Vector Deviation: Primary gaze off-axis.');
                    }

                    // Eye Gaze Tracking (Iris Displacement)
                    const gazeDeviated = checkGazeDeviation(landmarks);
                    if (gazeDeviated) {
                        throttlingLogViolation(VIOLATION_TYPES.GAZE_DEVIATION, 'Gaze Anomaly: Non-terminal focal concentration detected.');
                    }
                }
            }

            // 2. Object Detection (Prohibited Hardware)
            if (objectDetectorRef.current) {
                const objectResult = objectDetectorRef.current.detectForVideo(videoRef.current, timestamp);
                objectResult.detections?.forEach((detection) => {
                    const label = detection.categories[0].categoryName;
                    if (label === 'cell phone' || label === 'book' || label === 'laptop') {
                        throttlingLogViolation(VIOLATION_TYPES.PROHIBITED_OBJECT, \`Hardware Violation: Unauthorized artifact [\${label.toUpperCase()}] detected in secure zone.\`);
                        showWarningModal(\`Security Breach: Unauthorized item [\${label}] detected.\`);
                    }
                });
            }
        }

        // 3. Acoustic Analysis (Voice/Noise)
        if (analyserRef.current) {
            const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
            analyserRef.current.getByteFrequencyData(dataArray);
            const average = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
            const normalizedVol = average / 255;
            if (normalizedVol > PROCTORING_CONFIG.AUDIO_LEVEL_THRESHOLD) {
                throttlingLogViolation(VIOLATION_TYPES.VOICE_DETECTED, 'Acoustic Alert: Sustained vocal or environmental disturbance.');
            }
        }

        if (proctoringActive) {
            requestRef.current = requestAnimationFrame(detectFrame);
        }
    };

    const checkGazeDeviation = (landmarks) => {
        // Iris landmarks: Left (468-472), Right (473-477)
        const leftIris = landmarks[468];
        const leftEyeInner = landmarks[133];
        const leftEyeOuter = landmarks[33];
        
        if (leftIris && leftEyeInner && leftEyeOuter) {
            const relativePos = (leftIris.x - leftEyeOuter.x) / (leftEyeInner.x - leftEyeOuter.x);
            if (relativePos < 0.25 || relativePos > 0.75) return true;
        }
        return false;
    };`;

// Use a more flexible regex that tolerates extra spaces or line breaks
const regex = /const detectFrame = async \(\) => \{[\s\S]*?requestRef\.current = requestAnimationFrame\(detectFrame\);[\s\S]*?\}[\s\S]*?\};/m;

if (regex.test(content)) {
    content = content.replace(regex, newDetectFrame);
    fs.writeFileSync(path, content);
    console.log('Successfully updated detectFrame');
} else {
    console.log('Could not find detectFrame with regex');
    // Try a simpler regex to see what's happening
    if (/const detectFrame = async \(\) => \{/.test(content)) {
        console.log('Found start of detectFrame');
    }
}
