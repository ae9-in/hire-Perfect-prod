export class CameraManager {
    private static activeStream: MediaStream | null = null;
    private static activeLandmarker: any | null = null;

    static register(stream: MediaStream, landmarker?: any) {
        // Stop any previous stream before registering a new one
        this.stopAll();

        this.activeStream = stream;
        this.activeLandmarker = landmarker;
        console.log("CameraManager: Resource registered.");
    }

    static stopAll() {
        console.log("CameraManager: Nuclear stop triggered.");
        if (this.activeStream) {
            this.activeStream.getTracks().forEach(track => {
                try {
                    track.stop();
                    track.enabled = false;
                } catch (e) {
                    console.error("Failed to stop track:", e);
                }
            });
            this.activeStream = null;
        }

        if (this.activeLandmarker) {
            try {
                // Ultra-defensive: Use an internal copy to avoid races and check specifically for method presence
                const landmarker = this.activeLandmarker;
                if (landmarker && typeof landmarker === 'object') {
                    if (Object.prototype.hasOwnProperty.call(landmarker, 'close') || typeof landmarker.close === 'function') {
                        try {
                            landmarker.close();
                        } catch (innerError) {
                            console.warn("CameraManager: Internal close method failed, suppressing.");
                        }
                    }
                }
            } catch (e) {
                console.error("CameraManager: Fatal wrapper crash during landmarker release:", e);
            } finally {
                this.activeLandmarker = null;
            }
        }

        // Also attempt to find any rogue video elements and pause them
        if (typeof document !== 'undefined') {
            const videos = document.querySelectorAll('video');
            videos.forEach(v => {
                v.pause();
                v.srcObject = null;
                v.load();
            });
        }
    }
}

export default CameraManager;
