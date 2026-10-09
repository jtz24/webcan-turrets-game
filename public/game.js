class Game {
    constructor(gameContainer) {
        // console.log("Game 类已实例化");
        this.gameContainer = gameContainer;
        this.gameArea = gameContainer.querySelector('#game-area');
        this.gameArea.style.position = 'relative';
        this.gameArea.style.width = '100%';
        this.gameArea.style.height = '100%';
        this.gameArea.style.overflow = 'hidden';
        this.width = this.gameArea.clientWidth;
        this.height = this.gameArea.clientHeight;
        
        this.state = 'menu';
        this.score = 0;
        this.lives = 3; // 设置生命值为3
        this.timeLeft = 60; // 设置游戏时间为60秒
        this.countdownTime = 5;
        this.countdownTimer = null;
        this.countdownStartTime = null;
        this.isCountingDown = false;

        // 绑定方法到实例
        this.updateGame = this.updateGame.bind(this);
        this.handleClick = this.handleClick.bind(this);

        this.objects = [];
        this.projs = [];
        this.lastSpawnTime = 0;
        this.spawnInterval = 1000; // 每秒成一个对象
        this.playerPosition = this.width / 2;
        this.playerL=new Player('L');
        this.playerR=new Player('R');
        this.playerLA=90;
        this.playerRA=90;
        this.cooldown=300;

        // 添加鼠标事件监听器
        this.gameArea.addEventListener('click', this.handleClick);

        this.difficulty = 1;

        // 在 constructor 中
        this.starSound = document.getElementById('starSound');
        this.balloonSound = document.getElementById('balloonSound');
        this.catchSound = document.getElementById('catchSound');
        
        this.videoElement = document.getElementById('input-video');
        this.poseCanvas = document.getElementById('pose-canvas');
        this.poseCanvas.width = this.width;
        this.poseCanvas.height = this.height;

        // 检查可用的摄像头
        this.checkAvailableCameras().then(devices => {
            if (devices.length > 0) {
                this.startCamera(devices[0].deviceId);
            } else {
                console.error("No cameras found");
                this.handleCameraError(new Error("No cameras found"));
            }
        }).catch(error => {
            console.error("Error checking cameras:", error);
            this.handleCameraError(error);
        });

        // 添加这些行来检查 pose-container 的位置
        const poseContainer = document.getElementById('pose-container');
        console.log('Pose container position:', poseContainer.getBoundingClientRect());
        console.log('Pose container style:', window.getComputedStyle(poseContainer));

        
        this.difficultyScreen = new DifficultyScreen(this);

        this.menu = new Menu(this);
        this.state = 'menu';
        this.menu.draw(); // 初始显示菜单
        
        // 开始游戏循环
        this.updateGame();

        this.gameTime = 0;

        // 初始化音效
        this.catchSound = new Audio('public/Assets/sound/kaching.ogg');
        
        this.landmarkData = [];
        this.userId = null;
        this.isCollectingData = false;
        this.lastDataCollectionTime = 0;
        this.dataCollectionInterval = 1000 / 30; // 每30帧数据
        
        // 添加新的音效
        this.slapSound = new Audio('public/Assets/sound/slap.ogg');
        this.squeak = new Audio('public/Assets/sound/baby-squeak-toy-2-183912.ogg');
        this.screamingSound = new Audio('public/Assets/sound/screaming.ogg');
        this.gameplayMusic = new Audio('public/Assets/sound/Komiku_-_12_-_Bicycle.ogg');
        this.menuMusic = new Audio('public/ssets/sound/music.ogg');
        
        this.poseDetection = null; // 添加这行
    }

    async checkAvailableCameras() {
        const devices = await navigator.mediaDevices.enumerateDevices();
        return devices.filter(device => device.kind === 'videoinput');
    }

    startCamera(deviceId) {
        navigator.mediaDevices.getUserMedia({ 
            video: { 
                deviceId: deviceId,
                width: { ideal: 1280 },
                height: { ideal: 720 },
                frameRate: { ideal: 30 }
            } 
        }).then(stream => {
            this.videoElement.srcObject = stream;
            this.videoElement.onloadedmetadata = () => {
                this.videoElement.play();
                console.log("Video is playing");
                
                // 视频流设置好后，初始化姿势检测
                this.poseDetection = new PoseDetection(this.videoElement, this.poseCanvas, this.onPoseDetected.bind(this));
                this.poseDetection.start().catch(error => {
                    console.error("Failed to start pose detection:", error);
                });
            };
        }).catch(error => {
            console.error("Error accessing camera:", error);
            this.handleCameraError(error);
        });
    }
    
    start() {
        console.log("Game.start() called");
        this.state = 'difficulty';
        this.difficultyScreen.draw();
    }

    updateGame() {
        // console.log("Current game state:", this.state);
        switch (this.state) {
            case 'menu':
                // 菜单状态下不需要更新，保持静态
                break;
            case 'difficulty':
                // 难度选择界面由 DifficultyScreen 类处理
                break;
            case 'countdown':
                // 倒计时现在由 updateCountdown 方法处理
                break;
            case 'playing':
                this.updatePlaying();
                break;
            case 'gameover':
                // 游戏结束状态保持静态
                break;
        }

        requestAnimationFrame(this.updateGame.bind(this));
    }
    updatePlaying() {
        // 生成新的对象
        const settings = difficulty_map[this.difficulty];
        const spawnInterval = settings.STAR_SPAWN_TIME * 1000; // 添加这行，转换为毫秒
        
        if (Date.now() - this.lastSpawnTime > spawnInterval){//spawnInterval) { // 使用新的间隔
            this.spawnObject();
            if (Math.random()<0.5){
                this.spawnObject();
            }
            this.lastSpawnTime = Date.now();
        }
        this.clearGameObjects();

        // 更新和绘制所有对象
        this.objects = this.objects.filter(obj => {
            obj.update(Date.now() - this.lastUpdateTime);
            if (obj.shouldRemove()) {
                return false;
            }
            if (obj.rect.y>this.height-50 && (!obj.isBurst)){
                obj.burst();
                this.lives--;
            }
            return true;
        });
        this.projs = this.projs.filter(obj => {
            obj.update(Date.now() - this.lastUpdateTime);
            if (obj.shouldRemove()) {
                return false;
            }
            return true;
        });
        this.cooldown-=Date.now() - this.lastUpdateTime;
        if (this.cooldown<=0){
            if (this.playerL.active){
                const objL = new Projectile(this.width/2-10,this.height-7,this.playerL.angle);
                this.projs.push(objL);
            }
            if (this.playerR.active){
                const objR = new Projectile(this.width/2-10,this.height-7,this.playerR.angle);
                this.projs.push(objR);
            }
            this.cooldown=150;
        }

        this.playerL.update(this.playerLA);
        this.playerR.update(this.playerRA);

        this.checkCollisions();
        this.drawHUD();

        this.gameTime += Date.now() - this.lastUpdateTime;
        this.lastUpdateTime = Date.now();
        this.timeLeft = Math.max(0, 60000 - this.gameTime);

        if (this.timeLeft <= 0 || this.lives <= 0) {
            this.endGame();
        }
    }

    spawnObject() {
        const settings = difficulty_map[this.difficulty];
        if (!settings) {
            console.error(`Invalid difficulty setting: ${this.difficulty}`);
            this.difficulty = 'medium';
            settings = difficulty_map['medium'];
        }

        // 计算生成范围
        const centreX = this.width / 2;
        // 使用 POSITION_FACTOR 来计算实际的生成范围
        const spawnWidth = this.width / settings.POSITION_FACTOR; // 范围会随难度变化
        
        // 计算生成范围的左右边界
        const minX = centreX - (spawnWidth / 2);
        const maxX = centreX + (spawnWidth / 2);

        const centreY = this.height / 2;
        const spawnHeight = this.height / settings.POSITION_FACTOR;
        // 在计算出的范围内随机生成位置
        
        const object = //isStar ? 
            // new Star(x, y, this.height, this.difficulty, this.gameArea) ;//: 
            new Ship(minX+Math.random()*spawnWidth, 0, this.difficulty);
        
        this.objects.push(object);
        this.lastSpawnTime = Date.now();
    }

    checkCollisions() {
        this.objects.forEach(obj => {
            if (obj.invframes>0){return;}
            let collision=false;
            this.projs.forEach(proj => {if (this.isColliding(proj.getRect(),obj.getRect())){collision=true;}})
            if (collision) {
                obj.health-=1;
                obj.invframes=40;
                if (obj.health==0){
                    obj.burst();
                    this.score+=5;
                }
                // 移除碰撞的对象
                const element = document.querySelector(`[data-id="${obj.id}"]`);
                if (element) element.remove();
            }
        });
    }
    isColliding(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect2.height > rect2.y;
    }

    handleClick(event) {
        if (this.state !== 'menu') {
            const rect = this.gameArea.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            if (this.state === 'difficulty') {//this causes error
                // 处理难度选择界面的点击
                const result = this.difficultyScreen.handleClick(x, y);
                if (result) {
                    if (result.action === 'back') {
                        this.state = 'menu';
                        this.menu.draw();
                    } else if (result.action === 'submit') {
                        this.startGame(result.difficulty);
                    }
                }
            }
        }
    }
    handleMouseMove(event) {
        if (this.state === 'playing') {
            const rect = this.gameArea.getBoundingClientRect();
            const x = event.clientX - rect.left;
            // this.updatePlayerPosition(x);
        }
    }

    showPoseCanvas() {
        const poseContainer = document.getElementById('pose-container');
        if (poseContainer) {
            poseContainer.style.display = 'block';
        }
    }
    hidePoseCanvas() {
        const poseContainer = document.getElementById('pose-container');
        if (poseContainer) {
            poseContainer.style.display = 'none';
        }
    }
    onPoseDetected(results) {
        function angler(p1,p2){
            let ans=(Math.atan((results.poseLandmarks[p1].y-results.poseLandmarks[p2].y)/
            (results.poseLandmarks[p2].x-results.poseLandmarks[p1].x))/Math.PI*180);
            if (results.poseLandmarks[p2].x<results.poseLandmarks[p1].x){
                ans+=180;
                if (results.poseLandmarks[p1].y<results.poseLandmarks[p2].y){
                    ans-=360;
                }
            }
            if (ans<0){ans+=360;}
            return ans;
        }
        if (this.state !== 'playing' && this.state !== 'countdown') return;
        
        this.playerLA=angler(11,13)-90;
        this.playerRA=angler(12,14)-90;
        if (results.poseLandmarks) {
            // 翻转关键点的 x 坐标
            results.poseLandmarks.forEach(landmark => {
                landmark.x = 1 - landmark.x;
            });
            if (this.isCollectingData) {
                this.collectPoseData(results);
            }
        }

        this.drawPoseLandmarks(results);
    }
    handleCameraError(error) {
        let errorMessage = "无法访问摄像头。";
        if (error.name === "NotReadableError") {
            errorMessage += "请确保摄像头未其他程序占。";
        } else if (error.name === "NotAllowedError") {
            errorMessage += "请确保已授予浏览使用摄像头的权。";
        } else if (error.message === "No cameras found") {
            errorMessage = "未检测到可用的摄像头。";
        } else {
            errorMessage += "请检查摄像头连接并刷新页面重试。";
        }
        alert(errorMessage);
    }

    drawHUD() {
        const hudElement = document.createElement('div');
        hudElement.id = 'hud';
        hudElement.innerHTML = `
            <p style="font-size: 48px;">Score: ${this.score}</p>
            <p style="font-size: 48px;">Lives: ${this.lives}</p>
            <p style="font-size: 48px;">Time: ${Math.floor(this.timeLeft/1000)}</p>
        `;
        this.gameArea.appendChild(hudElement);
    }

    startGame() {
        this.clearGameObjects();
        this.score = 0;
        this.lives = 3;
        this.timeLeft = 60;
        this.objects = [];
        this.projs = [];
        this.lastSpawnTime = Date.now();
        this.state = 'countdown';
        this.countdownTime = 5;
        this.countdownStartTime = Date.now();
        this.gameTime = 0;

        // 确保难度设置被正确应用
        if (!this.difficulty || !difficulty_map[this.difficulty]) {
            console.log("Setting default difficulty to medium");
            this.difficulty = 'medium';
        }
        
        const settings = difficulty_map[this.difficulty];
        console.log(`Starting game with difficulty: ${this.difficulty}`, settings);
        
        // Initialize and start pose detection
        // this.initializePoseDetection();
        this.showPoseCanvas();

        this.updateCountdown();

        if (this.menuMusic) {
            this.menuMusic.pause();
        }
        if (this.gameplayMusic) {
            this.gameplayMusic.currentTime = 0;
            this.gameplayMusic.loop = true;
            // this.gameplayMusic.play();
        }
    }
    updateCountdown() {
        const currentTime = Date.now();
        const elapsedTime = (currentTime - this.countdownStartTime) / 1000;
        const remainingTime = Math.ceil(5 - elapsedTime);

        // 清除之前的计时元素
        const existingCountdown = document.getElementById('countdown');
        if (existingCountdown) {
            existingCountdown.remove();
        }

        if (remainingTime > 0) {
            const countdownElement = document.createElement('div');
            countdownElement.id = 'countdown';
            countdownElement.style.position = 'absolute';
            countdownElement.style.top = '50%';
            countdownElement.style.left = '50%';
            countdownElement.style.transform = 'translate(-50%, -50%)';
            countdownElement.style.fontSize = '72px';
            countdownElement.style.color = 'white';
            countdownElement.textContent = remainingTime;
            this.gameArea.appendChild(countdownElement);

            // 设置下一秒更新
            setTimeout(() => this.updateCountdown(), 1000);
        } else {
            // 倒计时结束,开始游戏
            this.state = 'playing';
            this.gameTime = 0;
            console.log("Countdown finished, starting game");
            // this.initializeGameObjects();
            this.objects = [];
            this.projs = [];
            // this.spawnInitialObjects();
            this.spawnObject();
            this.lastUpdateTime = Date.now();
            // this.drawPlayer(); // 在这里绘制玩家，游戏真正开始时
        }
    }

    endGame() {
        console.log("Game ended");
        this.state = 'gameover';
        this.drawGameOver();

        this.hidePoseCanvas();

        this.gameplayMusic.pause();
        this.menuMusic.play();
    }
    drawGameOver() {
        this.clearGameObjects();
        const gameOverElement = document.createElement('div');
        gameOverElement.id = 'game-over';
        gameOverElement.style.position = 'absolute';
        gameOverElement.style.top = '50%';
        gameOverElement.style.left = '50%';
        gameOverElement.style.transform = 'translate(-50%, -50%)';
        gameOverElement.style.textAlign = 'center';
        gameOverElement.style.color = 'white';
        gameOverElement.style.fontSize = '24px';
        gameOverElement.style.zIndex = '1000';

        const scoreText = document.createElement('h2');
        scoreText.textContent = `Your Score: ${this.score}`;
        scoreText.style.color = 'yellow';
        gameOverElement.appendChild(scoreText);

        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.justifyContent = 'space-between';
        buttonContainer.style.marginTop = '20px';

        const buttonStyle = `
            font-size: 24px;
            padding: 10px 20px;
            margin: 10px;
            cursor: pointer;
            background-color: #4CAF50;
            color: yellow;
            border: none;
            border-radius: 5px;
        `;

        const restartButton = document.createElement('button');
        restartButton.textContent = 'Restart';
        restartButton.style.cssText = buttonStyle;
        restartButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.startGame();
        });

        const quitButton = document.createElement('button');
        quitButton.textContent = 'Quit';
        quitButton.style.cssText = buttonStyle;
        quitButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.state = 'menu';
            this.menu.draw();
        });

        buttonContainer.appendChild(restartButton);
        buttonContainer.appendChild(quitButton);
        gameOverElement.appendChild(buttonContainer);

        this.gameArea.appendChild(gameOverElement);
    }

    drawPoseLandmarks(results) {
        const ctx = this.poseCanvas.getContext('2d');
        ctx.clearRect(0, 0, this.poseCanvas.width, this.poseCanvas.height);

        if (results.poseLandmarks) {
            drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS, { color: '#00FF00', lineWidth: 4 });
            drawLandmarks(ctx, results.poseLandmarks, { color: '#FF0000', lineWidth: 2 });
        }
    }
    collectPoseData() {
        if (this.isCollectingData && Date.now() - this.lastDataCollectionTime < this.dataCollectionInterval) {return;}
            
        if (this.poseDetection && this.poseDetection.lastResults) {
            const timestamp = new Date().toISOString();
            const frameData = {
                frame: this.landmarkData.length,
                timestamp: timestamp
            };

            this.poseDetection.lastResults.poseLandmarks.forEach((landmark, index) => {
                const names = ['NOSE', 'LEFT_EYE_INNER', 'LEFT_EYE', 'LEFT_EYE_OUTER', 'RIGHT_EYE_INNER', 'RIGHT_EYE', 'RIGHT_EYE_OUTER', 'LEFT_EAR', 'RIGHT_EAR', 'MOUTH_LEFT', 'MOUTH_RIGHT', 'LEFT_SHOULDER', 'RIGHT_SHOULDER', 'LEFT_ELBOW', 'RIGHT_ELBOW', 'LEFT_WRIST', 'RIGHT_WRIST', 'LEFT_PINKY', 'RIGHT_PINKY', 'LEFT_INDEX', 'RIGHT_INDEX', 'LEFT_THUMB', 'RIGHT_THUMB', 'LEFT_HIP', 'RIGHT_HIP', 'LEFT_KNEE', 'RIGHT_KNEE', 'LEFT_ANKLE', 'RIGHT_ANKLE', 'LEFT_HEEL', 'RIGHT_HEEL', 'LEFT_FOOT_INDEX', 'RIGHT_FOOT_INDEX'];
                frameData[`${names[index]}_x`] = landmark.x;
                frameData[`${names[index]}_y`] = landmark.y;
            });

            this.landmarkData.push(frameData);
        }
    }

    clearGameObjects() {
        this.gameArea.innerHTML = ''; // 清除游戏区域的所有内容
    }

    showDifficultyScreen() {
        this.state = 'difficulty';
        this.difficultyScreen.draw();
    }
    setDifficulty(difficulty) {
        this.difficulty = difficulty;
        console.log(`Difficulty set to: ${difficulty}`);
        // 应用难度设置
        const settings = difficulty_map[difficulty];
        if (settings) {
            console.log('Applying difficulty settings:', settings);
            this.spawnInterval = settings.STAR_SPAWN_TIME * 1000;
        } else {
            console.warn('Invalid difficulty setting, using default');
            this.difficulty = 'medium';
            this.spawnInterval = difficulty_map['medium'].STAR_SPAWN_TIME * 1000;
        }
    }
}
