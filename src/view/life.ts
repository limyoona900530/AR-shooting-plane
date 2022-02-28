class Live extends egret.Sprite {
    private lives : egret.Bitmap[] = [] ;
    private currentLive = 3 ;
    private fnc : Fnc = new Fnc() ;
    private dispacther : CustomDispatcher = new CustomDispatcher() ;

    constructor(dispatcher : CustomDispatcher) {
        super() ;
        this.dispacther = dispatcher ;
        this.init() ;
    }

    private init() : void {
        for(let i = 0 ; i < this.currentLive ; i ++) {
            let life = this.fnc.createBitmapByName("life_png") ;
            life.width = 40 ;
            life.height = 40 ;
            life.y = 10 ;
            life.x = i * life.width + 10 ;
            this.lives.push(life) ;
            this.addChild(life) ;
       
        }
    }

    public mininusBlood() {
        this.currentLive -- ;
        if(this.currentLive === 0 ) {
            //do game over
           
            this.dispacther.gameOver() ;
        }
        this.lives.forEach((item, index) => {
            index + 1 <= this.currentLive ? ' ' : (item.visible = false )
        })
    }

    public restart_life() {
        this.currentLive = 3 ;
        this.lives.forEach(item => (item.visible = true)) ;
    }
}