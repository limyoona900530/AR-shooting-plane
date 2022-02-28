class SceneBegin extends eui.Component implements eui.UIComponent {
    public begin: eui.Image ;
    private dispatcher : CustomDispatcher = new CustomDispatcher() ;
    
    constructor() {
        super() ;
        this.skinName = "resource/eui_skins/SceneBegin.exml" ;
    }

    protected partAdded(partName: string, instance: any): void {
        super.partAdded(partName, instance) ;
    }
    
    protected childrenCreated(): void {
        console.log(this.begin)  
        super.childrenCreated() 
        this.begin.once(egret.TouchEvent.TOUCH_TAP, this.start, this) 
    }

    private start() {
        egret.localStorage.clear() ;
        console.log("touch") ;
        this.parent.addChild(new SceneGame(this.dispatcher)) ;
        this.parent.removeChild(this);
    }
    
}