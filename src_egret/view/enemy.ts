class enemy extends egret.Sprite{
    private fnc : Fnc = new Fnc() ;
    public timerForEnemy = new egret.Timer(1000) ;
    public enemyList : egret.Bitmap[] = [] ;

    constructor() {
        super() ;
        this.init() ;
    }

    private init() {
        this.timerForEnemy.addEventListener(egret.TimerEvent.TIMER, () => {
            this.createEnemy() ;
        },this)
    }

    private createEnemy() {
        let enemy = this.fnc.createBitmapByName("enemy_png") ;
        enemy.width = 100 ;
        enemy.height = 100 ;
        let x = Math.floor(Math.random()*(egret.MainContext.instance.stage.stageWidth - enemy.width)) ;
        enemy.x = x ;
        enemy.y = 0 ;
        this.addChild(enemy) ;
        this.enemyList.push(enemy) ;
    }
}