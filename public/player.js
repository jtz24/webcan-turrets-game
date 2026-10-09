class Player extends GameObject{
    constructor(id){
        super('player',[0,0],[63,339]);
        this.scwidth=this.gameArea.clientWidth;
        this.scheight=this.gameArea.clientHeight;
        this.rect.x=this.scwidth/2-this.rect.width/2;
        this.rect.y=this.scheight-176;
        this.id=id;
        this.angle=90;
        this.active=true;
    }
    update(angle){
        super.update();
        this.angle=angle;
        console.log(angle);
        this.active=true;
        if (angle>180){this.angle=-90;this.active=false;}
        else if (angle>90){this.angle=90;this.active=false;}
        this.sprite.style.transform=`rotate(${this.angle}deg)`;
    }
}