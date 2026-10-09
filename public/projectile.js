class Projectile extends GameObject {
    constructor(x, y, angle) {
        super('projectile', [x,y], [20,20]);
        this.angle=angle/180*Math.PI;
        this.speed=2;
        this.width = this.gameArea.clientWidth;
        this.rect.y -= Math.cos(this.angle)*200;
        this.rect.x += Math.sin(this.angle)*200;
    }

    update(timedelta) {
        super.update();
        this.sprite.style.transform=`rotate(${this.angle}deg)`;
        this.rect.y -= this.speed*Math.cos(this.angle)*timedelta;
        this.rect.x += this.speed*Math.sin(this.angle)*timedelta;
    }

    shouldRemove() {
        return this.rect.y<0 || this.rect.x<0 || this.rect.x>this.width;
    }
}
