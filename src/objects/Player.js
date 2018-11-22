import Phaser from 'phaser';

class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(game, args = {}) {
    super(game, args.x || 0, args.y || 0, 'char');
    game.physics.add.existing(this);
    game.add.existing(this);

    this.setDepth(10);
    this.setSize(32, 32);
    this.setOffset(0, 24);
  }
}

export default Player;
