class PoseDetection {
    constructor(videoElement, canvasElement, onPoseDetected) {
        this.videoElement = videoElement;
        this.canvasElement = canvasElement;
        this.onPoseDetected = onPoseDetected;
        this.pose = new Pose({locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
        }});
        this.pose.setOptions({
            modelComplexity: 1,
            smoothLandmarks: true,
            enableSegmentation: false,
            smoothSegmentation: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });
        this.pose.onResults(this.onResults.bind(this));
        this.lastResults = null;
        this.videoElement.style.transform = 'scaleX(-1)';
    }
    async start() {
        console.log("开始姿势检测");
        try {
            await this.pose.initialize();
            await this.setupCamera();
            this.detectPose();
        } catch (error) {
            console.error("姿势检测启动错误:", error);
            throw error;
        }
    }
    async setupCamera() {
        console.log("设置摄像头");
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            this.videoElement.srcObject = stream;
            return new Promise((resolve) => {
                this.videoElement.onloadedmetadata = () => {
                    this.videoElement.play();
                    resolve();
                };
            });
        } catch (error) {
            console.error("摄像头设置错误:", error);
            throw error;
        }
    }
    async detectPose() {
        if (this.videoElement.readyState === 4) {
            try {
                await this.pose.send({image: this.videoElement});
            } catch (error) {
                console.error("姿势检测错误:", error);
            }
        }
        requestAnimationFrame(this.detectPose.bind(this));
    }
    onResults(results) {
        this.lastResults = results;
        if (this.onPoseDetected) {
            this.onPoseDetected(results);
        }
    }
}
