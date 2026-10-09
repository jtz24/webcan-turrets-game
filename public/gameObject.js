class GameObject {
    constructor(classname,pos,size) {
        this.classname=classname;
        this.size = size;
        this.rect = { x: pos[0], y: pos[1], width: this.size[0], height: this.size[1] };
        const gameContainer = document.getElementById("game-container");
        this.gameArea = gameContainer.querySelector('#game-area');
        this.sprite = null;
        this.id = Math.random().toString(36).substr(2, 9);
    }
    update(timedelta) {
        // 在子类中实现
        this.drawObject();
    }
    shouldRemove() {
        // 在子类中实现
    }
    getRect() {
        return this.rect;
    }
    drawObject() {
        // 检查是否已存在该对象的元素
        this.sprite = document.querySelector(`[data-id="${this.id}"]`);
        if (!this.sprite) {
            // 如果元素不存在，创建新元素
            this.sprite = document.createElement('div');
            this.sprite.className = this.classname;
            this.sprite.style.position = 'absolute';
            this.sprite.dataset.id = this.id;
            this.gameArea.appendChild(this.sprite);
        }
        // 更新元素的位置和大小
        this.sprite.style.left = `${this.rect.x}px`;
        this.sprite.style.top = `${this.rect.y}px`;
        this.sprite.style.width = `${this.rect.width}px`;
        this.sprite.style.height = `${this.rect.height}px`;
    }
}
