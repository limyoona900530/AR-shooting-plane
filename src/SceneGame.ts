class SceneGame extends eui.Component implements eui.UIComponent {
    private dispatcher : CustomDispatcher = new CustomDispatcher() ;
    private hero : egret.Bitmap ;
    private fnc : Fnc = new Fnc() ;
    private enemy : enemy = new enemy() ;
    private live : Live ;
    private bul : Bullet ;
    private restartBtn : egret.TextField ;
    private score_box : egret.TextField = new egret.TextField() ;
    private score : number = 0 ;
    private speedEnemy = 5 ;
    private speedBullet = 10 ;

    constructor(dispatcher : CustomDispatcher) {
        super() ;
        if(dispatcher) {
            this.dispatcher.addEventListener(CustomDispatcher.OVER, this.gameover, this) ;
            this.dispatcher.addEventListener(CustomDispatcher.RESTAR, this.restart, this) ;
        }
        this.skinName = "resource/eui_skins/SceneGame.exml" ;
    }

    protected partAdded(partName: string, instance: any): void {
        super.partAdded(partName, instance) ;
    }

    protected childrenCreated(): void {
        super.childrenCreated() ;
        this.live = new Live(this.dispatcher) ;
        this.init() ;
    }

    private init() : void {
        this.skyScroll() ;
        this.createHero() ;
        this.createScore() ;
        this.enemy.timerForEnemy.start() ;
        this.addChild(this.enemy) ;
        this.addChild(this.live) ;
        this.addEventListener(egret.Event.ENTER_FRAME, this.check, this) ;
    }
        
        

    //天空滚动
    private skyScroll() {
        let background = new bg(this.dispatcher)
        this.addChild(background)
        this.dispatcher.gamecontinue() 
    }

    private createHero() {
        this.hero = this.fnc.createBitmapByName("myplane_png") ;
        this.hero.height = 150 ;
        this.hero.width = 100 ;
        this.hero.x = egret.MainContext.instance.stage.stageWidth / 2 ;
        this.hero.y = egret.MainContext.instance.stage.stageHeight / 2  ;
        this.addChild(this.hero) ;
      
        this.hero.touchEnabled = true ;
        this.hero.anchorOffsetX = this.hero.width / 2 ;
		this.hero.anchorOffsetY = this.hero.height / 2 ;
		this.hero.addEventListener(egret.TouchEvent.TOUCH_MOVE, this.moveHero, this) ;
        this.hero.addEventListener(egret.Event.ENTER_FRAME, this.moveHerobyHead, this) ;
        this.bul = new Bullet(this.hero) ;
        this.addChild(this.bul) ;
    }

    //英雄移动
    //增加一个长期监听对象，可以一直获取LocalStrorage
    private moveHero(e) : void {
        this.hero.x = e.stageX ;
		this.hero.y = e.stageY ;
    }
    
    private moveHerobyHead() : void {
        
        let res = egret.localStorage.getItem("temp") ;
        console.log(res) ;
        let lef = this.hero.x - this.hero.width / 2 ;
        let rig = this.hero.x + this.hero.width / 2 ;
        let upp = this.hero.y - this.hero.height / 2 ;
        let doo = this.hero.y + this.hero.height / 2 ;
        let wid = egret.MainContext.instance.stage.stageWidth ;
        let hei = egret.MainContext.instance.stage.stageHeight ;
        
        if(res === "0" && upp >= 0){
            this.hero.y -= 15 ;
        } else if (res === "1" && doo <= hei) {
            this.hero.y += 15 ;
        } else if (res === "2" && lef >= 0) {
            this.hero.x -= 15 ;
        } else if (res === "3" && rig <= wid) {
            this.hero.x += 15 ;
        }
        egret.localStorage.clear() ;
        
    }

    private createScore() : void {
        this.score_box.x = 15 ;
        this.score_box.y = 60 ;
        this.score_box.size = 20 ;
        this.score_box.text = `${this.score}` ;
        this.addChild(this.score_box) ;
    }

    private check() : void {
        //敌机移动
        this.enemy.enemyList.forEach(eny=>{
            eny.y += this.speedEnemy ;
            let rect1 : egret.Rectangle = eny.getBounds() ;
            let rect2 : egret.Rectangle = this.hero.getBounds() ;
            rect1.x = eny.x ;
            rect1.y = eny.y ;
            rect2.x = this.hero.x - this.hero.width / 2  ;
            rect2.y = this.hero.y ;
            if(rect1.intersects(rect2)) {
                if(this.enemy.enemyList.indexOf(eny) !== -1) {
                    this.fnc.blood(eny, this, 'hero') ;
                    this.live.mininusBlood() ;
                    this.enemy.removeChild(eny) ;  
                    this.hero.x = egret.MainContext.instance.stage.stageWidth / 2 ;
                    this.hero.y = 4 * egret.MainContext.instance.stage.stageHeight / 5  ;
                    this.enemy.enemyList.splice(this.enemy.enemyList.indexOf(eny), 1 ) ;
                    
                }
            }
            if(eny.y > egret.MainContext.instance.stage.stageHeight) {
                //do sth
            }
        })

        //子弹移动
        this.bul.arrayBullet1.forEach(bul => {
            bul.y -= this.speedBullet ;

            this.enemy.enemyList.some(eny => {
                let rect1 : egret.Rectangle = bul.getBounds() ;
                let rect2 : egret.Rectangle = eny.getBounds() ;
                rect1.x = bul.x ;
                rect1.y = bul.y ;
                rect2.x = eny.x ;
                rect2.y = eny.y ;
                if(rect1.intersects(rect2)) {
                    this.score ++ ;
                    this.score_box.text = `${this.score}` ;
                    this.fnc.blast(eny, this) ;
                    this.enemy.removeChild(eny) ;
                    this.bul.removeChild(bul) ;
                    this.enemy.enemyList.splice(this.enemy.enemyList.indexOf(eny), 1 ) ;
                    this.bul.arrayBullet1.splice(this.bul.arrayBullet1.indexOf(bul), 1 ) ;
                }
            })
        })
        
    }

    //游戏结束
    private gameover () {
       
        this.removeEventListener(egret.Event.ENTER_FRAME, this.check, this) ;
        this.fnc.blast(this.hero, this, 'hero') ;
        this.removeChild(this.hero) ;
        this.enemy.enemyList.forEach(eny => {
            this.enemy.removeChild(eny) ;
        })
        this.enemy.enemyList = [] ;
        this.bul.arrayBullet1.forEach(bull => {
           this.bul.removeChild(bull) ;
        })
        this.bul.arrayBullet1 = [] ;
        this.enemy.timerForEnemy.stop() ;
        this.bul.timer_launch.stop() ;

        this.restartBtn = new egret.TextField() ;
        this.restartBtn.text = "restart" ;
        this.restartBtn.size = 100 ;
        this.restartBtn.textColor = 0x000000 ;
        this.restartBtn.x = egret.MainContext.instance.stage.stageWidth / 2 - this.restartBtn.width / 2 ;
        this.restartBtn.y = egret.MainContext.instance.stage.stageHeight / 2 - this.restartBtn.height / 2 ;
        this.restartBtn.touchEnabled = this.enabled ;
        this.restartBtn.addEventListener(egret.TouchEvent.TOUCH_TAP, () => {
         
            this.restart() ;
        },this)
        this.addChild(this.restartBtn) ;
    }

    private restart() {
       
        this.score = 0 ;
        this.score_box.text = `${this.score}` ;
        this.hero.x = egret.MainContext.instance.stage.stageWidth / 2 ;
        this.hero.y = egret.MainContext.instance.stage.stageHeight / 2  ;
        this.addChild(this.hero) ;
        this.removeChild(this.restartBtn) ;
        this.addEventListener(egret.Event.ENTER_FRAME, this.check, this) ;
        this.enemy.timerForEnemy.start() ;
        this.bul.timer_launch.start() ;
        this.live.restart_life() ;
    }
}