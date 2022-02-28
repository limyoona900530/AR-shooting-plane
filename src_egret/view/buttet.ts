class Bullet extends egret.Sprite {
    private fnc : Fnc = new Fnc() ;
    private myplane : egret.Bitmap ;
    public timer_launch : egret.Timer = new egret.Timer(800) ;
    public  arrayBullet1 : egret.Bitmap[] = [] ; 
    public  arrayBullet2 : egret.Bitmap[] = [] ; 

    constructor(myplane : egret.Bitmap) {
        super() ;
        this.myplane = myplane ;
        this.init() ;
        
    }

    private init() {
        this.timer_launch.start() ;
        this.timer_launch.addEventListener(egret.TimerEvent.TIMER, () => {
            this.createBullet() ;
        },this)
    }

    private createBullet() {
        let slug1 = this.fnc.createBitmapByName("slug_png") ;
        let slug2 = this.fnc.createBitmapByName("slug_png") ;
        slug1.width = 20 ;
        slug1.height = 20 ;
        slug2.width = 20 ;
        slug2.width = 20 ;
        slug1.x = this.myplane.x - 0.33 * this.myplane.width ;
        slug1.y = this.myplane.y ;
        slug2.x = this.myplane.x + 0.33 * this.myplane.width ;
        slug2.y = this.myplane.y ;
        slug1.anchorOffsetX = slug1.width / 2 ;
		slug1.anchorOffsetY = 70 ;
        slug2.anchorOffsetX = slug2.width / 2 ;
		slug2.anchorOffsetY = 70 ;
        this.arrayBullet1.push(slug1) ;
        this.arrayBullet1.push(slug2) ;
        this.addChild(slug1) ;
        this.addChild(slug2) ;
        
    }
}