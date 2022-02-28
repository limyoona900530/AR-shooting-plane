class CustomDispatcher extends egret.EventDispatcher {

    public static OVER: string = "gameover";
    public static STOP: string = "gamestop";
    public static START: string = "gamestart";
    public static CONTINUE: string = "continue";
    public static BLOOD: string = "blood"; // 流血
    public static RESTAR: string = "restar"; // 流血
    public static PROP: string = "prop"; // 流血
  
    constructor() {
      super()
    }
  
    public gameOver(): void {
      this.dispatchEventWith(CustomDispatcher.OVER);
    }
  
    public startGame(): void {
      this.dispatchEventWith(CustomDispatcher.START);
    }
  
    public gameStop(): void {
      this.dispatchEventWith(CustomDispatcher.STOP);
    }
  
    public gamecontinue(): void {
      this.dispatchEventWith(CustomDispatcher.CONTINUE);
    }
  
    public buckleBliid(): void {
      this.dispatchEventWith(CustomDispatcher.BLOOD);
    }
  
    public restar(): void {
      this.dispatchEventWith(CustomDispatcher.RESTAR);
    }
  
    public gainProp():void{
      this.dispatchEventWith(CustomDispatcher.PROP);
    }
  }