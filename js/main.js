import Player     from './player/index'
import Enemy      from './npc/enemy'
import BackGround from './runtime/background'
import GameInfo   from './runtime/gameinfo'
import Music      from './runtime/music'
import DataBus    from './databus'

let ctx   = canvas.getContext('2d')
let databus = new DataBus()

/**
 * 游戏主函数
 */
export default class Main {
  constructor() {
    this.restart()
  }

  restart() {
    databus.reset()

    canvas.removeEventListener(
      'touchstart',
      this.touchHandler
    )

    this.bg       = new BackGround(ctx)
    this.player   = new Player(ctx)
    this.player.setCollision(38, 31,5 ,10)
    this.pipes    = new Array()
    this.gameinfo = new GameInfo()
    this.music    = new Music()

    this.initPipes();

    window.requestAnimationFrame(
      this.loop.bind(this),
      canvas
    )
  }

  initPipes() {
    for (var i = 0; i < 4; i++) {
      if (i % 2 == 0) {
        this.pipes[i] = new Enemy(120 * i + window.innerWidth + 200, Math.random() * 50 - 80, 'images/pipe2.png', true);
      } else {
        this.pipes[i] = new Enemy(120 * i + window.innerWidth + 200, window.innerHeight - 200, 'images/pipe.png', false);
      }
      this.pipes[i].setCollision(85, 360 , 0, 0)
    }
  }

  // 全局碰撞检测
  collisionDetection() {
    let that = this
   
    for (var i = 0; i < 4; i++) {
      if (this.pipes[i].isCollideWith(this.player)) {
        this.player.playAnimation()
        databus.gameOver = true
      }

      if (this.pipes[i].x <= this.player.x && this.pipes[i].x >= this.player.x - 2) {
        databus.score++
      }
    }

    if (this.player.y > window.innerHeight-25 || this.player.y < -30) {
      databus.gameOver = true
    }


    
  }

  //游戏结束后的触摸事件处理逻辑
  touchEventHandler(e) {
     e.preventDefault()

    let x = e.touches[0].clientX
    let y = e.touches[0].clientY

    let area = this.gameinfo.btnArea

    if (   x >= area.startX
        && x <= area.endX
        && y >= area.startY
        && y <= area.endY  )
      this.restart()
    }

    /**
     * canvas重绘函数
     * 每一帧重新绘制所有的需要展示的元素
     */
    render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    this.bg.render(ctx)

    this.player.drawToCanvas(ctx)
    
    for (var i = 0; i < 4; i++) {
      this.pipes[i].drawToCanvas(ctx)
    }

    // this.player.rotate(ctx, this.player.gravity * 2)

    databus.animations.forEach((ani) => {
      if ( ani.isPlaying ) {
        ani.aniRender(ctx)
      }
    })

    this.gameinfo.renderGameScore(ctx, databus.score)
  }

  // 游戏逻辑更新主函数
  update() {
    if (databus.gameOver) {
      return
    }

    this.player.update()

    this.bg.update()

    for (var i = 0; i < 4; i++) { 

    this.pipes[i].update()

    }

    this.collisionDetection()
  }

  // 实现游戏帧循环
  loop() {
    databus.frame++

    this.update()
    this.render()

    // 游戏结束停止帧循环
    if ( databus.gameOver && !this.player.isPlaying) {
      this.gameinfo.renderGameOver(ctx, databus.score)

      this.touchHandler = this.touchEventHandler.bind(this)
      canvas.addEventListener('touchstart', this.touchHandler)

      return
    }

    window.requestAnimationFrame(
      this.loop.bind(this),
      canvas
    )
  }
}
