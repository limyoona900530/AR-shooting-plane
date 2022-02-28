class bg extends egret.Sprite {
    private dispatcher: CustomDispatcher
  
    private fnc: Fnc = new Fnc()
  
    private sky: egret.Bitmap[] = []
  
    private speed_bg: number = 5
  
    constructor(dispatcher: CustomDispatcher) {
      super()
      this.dispatcher = dispatcher
      if (dispatcher) {
        this.dispatcher.addEventListener(CustomDispatcher.START, this.startGame, this)
        this.dispatcher.addEventListener(CustomDispatcher.STOP, this.stopGame, this)
        this.dispatcher.addEventListener(CustomDispatcher.CONTINUE, ()=>{
          this.addEventListener(egret.Event.ENTER_FRAME,this.moveBg,this)
        }, this)
      
      }
      this.initBg()
    }
  
    private initBg(): void {
      //let str = Math.floor(Math.random()*2) === 1?'bg2_jpg':'bg_jpg';
      for (let i = 0; i < 2; i++) {
        this.sky[i] = this.fnc.createBitmapByName("background_png") ;
        this.sky[i].width = egret.MainContext.instance.stage.stageWidth;
        this.sky[i].height = egret.MainContext.instance.stage.stageHeight;
      }
      this.addChild(this.sky[0])
      this.addChild(this.sky[1])
  
      this.sky[1].y = -egret.MainContext.instance.stage.stageHeight;

    }
  
    private moveBg(): void {
      this.sky.forEach((item, index) => {
        item.y += this.speed_bg
        if (item.y > item.height - this.speed_bg - 5) {
          item.y = -item.height
        }
      })
    }
  
    private startGame(): void {
      this.addEventListener(egret.Event.ENTER_FRAME,this.moveBg,this)
    }
  
    private stopGame():void{
      this.removeEventListener(egret.Event.ENTER_FRAME,this.moveBg,this)
    }
  }