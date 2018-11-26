import Phaser from 'phaser';

class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(game, args = {}) {
    super(game, args.position.x || 0, args.position.y || 0, args.sprite || 'char');
    game.physics.add.existing(this);
    game.add.existing(this);

    this.uid = args.uid;
    this.name = args.name;
    this.sprite = args.sprite;
    this.setDepth(10);
    this.setSize(32, 32);
    this.setOffset(0, 24);
  }

  update(entity) {
    if (this.body) {
      const diffX = this.body.x - entity.position.x;
      if (Math.abs(diffX) > 1) {
        this.body.setVelocityX(diffX > 0 ? -100 : 100);
      } else {
        this.body.setVelocityX(0);
      }

      const diffY = this.body.y - entity.position.y;
      if (Math.abs(diffY) > 1) {
        this.body.setVelocityY(diffY > 0 ? -100 : 100);
      } else {
        this.body.setVelocityY(0);
      }

      if (this.body.velocity.y > 0) {
        this.anims.play(`${this.sprite}-down`, true);
      } else if (this.body.velocity.x < 0) {
        this.anims.play(`${this.sprite}-left`, true);
      } else if (this.body.velocity.x > 0) {
        this.anims.play(`${this.sprite}-right`, true);
      } else if (this.body.velocity.y < 0) {
        this.anims.play(`${this.sprite}-up`, true);
      } else {
        this.anims.stop();
      }
    }
  }
}

export default Player;
