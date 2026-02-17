export class CameraManager {
    private static stream: MediaStream | null = null;
    private static resources: any[] = [];

    static setStream(stream: MediaStream) {
        this.stream = stream;
    }

    static getStream(): MediaStream | null {
        if (this.stream && this.stream.active) {
            const tracks = this.stream.getTracks();
            if (tracks.some(t => t.readyState === 'live' && t.enabled)) {
                return this.stream;
            }
        }
        return null;
    }

    static addResource(resource: any) {
        if (resource) this.resources.push(resource);
    }

    static stop() {
        console.log("[CM_V15] Safe stop triggered");

        // Stop MediaStream
        if (this.stream) {
            try {
                this.stream.getTracks().forEach(track => {
                    track.stop();
                    track.enabled = false;
                });
            } catch (e) {
                console.warn("[CM_V15] Stream stop error:", e);
            }
            this.stream = null;
        }

        // Dispose AI models
        this.resources.forEach(resource => {
            try {
                if (resource && typeof resource.close === "function") {
                    resource.close();
                } else if (resource && typeof resource.stop === "function") {
                    resource.stop();
                }
            } catch (e) {
                console.warn("[CM_V15] Resource disposal error:", e);
            }
        });

        this.resources = [];
    }
}

export default CameraManager;
