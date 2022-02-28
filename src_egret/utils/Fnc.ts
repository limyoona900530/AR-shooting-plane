class Fnc {
	public createBitmapByName(name: string) {
		let result = new egret.Bitmap()
		let texture: egret.Texture = RES.getRes(name)
		result.texture = texture
		return result
	}

	// 扣血
	public blood(ref: egret.Bitmap, that, type?: string) {
		// 扣血动画 虽然和爆炸的操作是一样的 但是后期可能会换不同的图片 音频等 所以不封装在一起写 而拆成两个方法
		let img: egret.Bitmap = this.createBitmapByName('explosion_png')
		if (type === 'hero') {
			img.x = ref.x 
			img.y = ref.y 
		} else {
			img.x = ref.x
			img.y = ref.y
		}
		img.width = 100
		img.height = 150
		let imgTimer = new egret.Timer(18)
		let startIndex = 1
		imgTimer.addEventListener(
			egret.TimerEvent.TIMER,
			() => {
				startIndex++
				//img.texture = RES.getRes(`explosion_png`)
				if (startIndex === 9) {
					imgTimer.stop()
					that.removeChild(img)
				}
			},
			this
		)
		// // let timer =	setInterval(()=>{
		// // 	startIndex++
		// // 	img.texture = RES.getRes(`explosion${startIndex}_png`)
		// // 	if (startIndex === 9) {
		// // 		clearInterval(timer)
		// // 		that.removeChild(img)
		// // 	}
		// // },18)
		that.addChild(img)
		imgTimer.start()
	}

	// 爆炸
	public blast(ref: egret.Bitmap, that, type?: string) {
		// 爆炸显示公共方法
		let img: egret.Bitmap = this.createBitmapByName('enemyBlast_png')
		if (type === 'hero') {
			img.x = ref.x - ref.width / 2
			img.y = ref.y - ref.height / 2
		} else {
			console.log("enemy blasting") ;
			img.x = ref.x
			img.y = ref.y
		}
		img.width = 100
		img.height = 100
		let imgTimer = new egret.Timer(18)
		let startIndex = 1
		imgTimer.addEventListener(
			egret.TimerEvent.TIMER,
			() => {
				startIndex++
				img.texture = RES.getRes("enemyBlast_png") ;
				if (startIndex === 3) {
					imgTimer.stop()
					that.removeChild(img)
				}
			},
			this
		)
		that.addChild(img)
		imgTimer.start()
	}
}