class ImageLoader {
    static load(imgPath, size = "default") {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                if (size !== "default") {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = size[0];
                    canvas.height = size[1];
                    ctx.drawImage(img, 0, 0, size[0], size[1]);
                    resolve(canvas);
                } else {
                    resolve(img);
                }
            };
            img.onerror = reject;
            img.src = imgPath;
        });
    }
    static draw(ctx, img, pos, posMode = "top_left") {
        if (posMode === "center") {
            pos = [pos[0] - img.width / 2, pos[1] - img.height / 2];
        }
        ctx.drawImage(img, pos[0], pos[1]);
    }
}
class Background {
    constructor(gameArea, imagePath) {
        this.gameArea = gameArea;
        this.image = new Image();
        this.image.src = 'public/' + imagePath;
        console.log("Loading background image:", imagePath);
        this.image.onload = () => {
            console.log("Background image loaded successfully");
            this.draw();
        };
        this.image.onerror = () => {
            console.error("Failed to load background image:", imagePath);
        };
    }
    draw() {
        console.log("Drawing background");
        const backgroundElement = document.createElement('div');
        backgroundElement.style.position = 'absolute';
        backgroundElement.style.top = '0';
        backgroundElement.style.left = '0';
        backgroundElement.style.width = '100%';
        backgroundElement.style.height = '100%';
        backgroundElement.style.backgroundImage = `url(${this.image.src})`;
        backgroundElement.style.backgroundSize = 'cover';
        backgroundElement.style.backgroundPosition = 'center';
        backgroundElement.style.zIndex = '-1';
        this.gameArea.appendChild(backgroundElement);
    }
}
