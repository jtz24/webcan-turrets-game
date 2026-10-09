class Ship extends GameObject {
    constructor(x, y, difficulty) {
        const settings = difficulty_map[difficulty];
        super('ship', [x,y], [100,100]);
        this.screenHeight = this.gameArea.clientHeight;
        this.spawntime = Date.now();
        this.speed = 0.1;
        this.health = 10;
        this.isBurst = false;
        this.invframes=0;
    }
    update(timedelta) {
        if (!this.isBurst) {
            this.rect.y += this.speed*timedelta;
        }
        this.invframes-=timedelta;
        super.update();
    }
    drawObject() {
        super.drawObject();
        if (this.isBurst) {
            this.sprite.classList.add('burst');
        } else {
            this.sprite.classList.remove('burst');
        }
        if (this.invframes>0 && !this.isBurst){
            this.sprite.classList.add('inv');
        }else{
            this.sprite.classList.remove('inv');
        }
    }
    shouldRemove() {
        return  (this.isBurst && Date.now() - this.burstTime > 500);
    }
    burst() {
        this.isBurst = true;
        this.burstTime = Date.now();
    }
}
