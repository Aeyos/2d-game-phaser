import Phaser from 'phaser';

import State from '../State';
import DEPTH from '../config/depth';

class MousePointer {
  constructor() {
    this.rect = new Phaser.Geom.Rectangle(-32, -32, 32, 32);
    this.graphics = State.$scene.add.graphics({ lineStyle: { color: 0xFFFFFF } });

    this.graphics.setDepth(DEPTH.ACTION_CURSOR);
  }

  update() {
    this.graphics.clear();
    this.rect.x = (
      (
        State.$mouse.x - (State.$camera.config.width / 2)
      ) / 3) + State.$camera.midPoint.x;
    this.rect.y = (
      (
        State.$mouse.y - (State.$camera.config.height / 2)
      ) / 3) + State.$camera.midPoint.y;
    this.rect.x -= this.rect.x % 32;
    this.rect.y -= this.rect.y % 32;

    this.graphics.strokeRectShape(this.rect);
  }
}

export default MousePointer;
