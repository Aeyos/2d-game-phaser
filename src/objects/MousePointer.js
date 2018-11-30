import Phaer from 'phaser';

class MousePointer {
  constructor(app) {
    // console.log('app.input.mousePointer', app.input.mousePointer)
    this.app = app;
    this.mouse = app.input.mousePointer;
    this.rect = new Phaser.Geom.Rectangle(768, 768, 32, 32);
    this.graphics = this.app.add.graphics({ lineStyle: { color: 0xFFFFFF } });
    this.graphics.setDepth(99)


    // graphics.setInteractive(rect, event);
  }

  update() {
    this.graphics.clear()
    this.graphics.strokeRectShape(this.rect);
    console.log('a', this.mouse)
    this.rect.x = this.app.input.mousePointer.worldX - (this.app.input.mousePointer.worldX % 32);
    this.rect.y = this.app.input.mousePointer.worldY - (this.app.input.mousePointer.worldY % 32);
  }
}

export default MousePointer;
