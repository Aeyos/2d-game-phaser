import Phaser from 'phaser';
import DEPTH from '../config/depth';

class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(game, args = {}) {
    super(game, args.position.x || 0, args.position.y || 0, args.sprite || 'char');
    game.physics.add.existing(this);
    game.add.existing(this);

    this.uid = args.uid;
    this.name = args.info.name;
    this.level = args.info.level;
    this.speed = args.info.speed;
    this.sprite = args.sprite;
    this.type = args.type;
    this.key = this.type === 'player' ? this.uid : this.sprite;

    this.text = game.add.text(0, 0, `[${this.level}] ${this.name}`, { align: 'center', color: '#00ef00', fontSize: '8px', fontFamily: 'Tahoma', stroke: 'black', strokeThickness: 1, resolution: 3 });
    this.text.setDepth(DEPTH.TEXT);

    this.setSize(32, 32);
    this.setOffset(0, 24);
  }

  playerUpdate() {
    this.text.x = (this.body.position.x + (this.width / 2)) - Math.round(this.text.width / 2);
    this.text.y = this.body.position.y - (this.height - 16);
    this.setDepth(DEPTH.BASE + (this.y / 32));
  }

  playAnim(direction) {
    this.anims.play(`${this.key}-${direction}`, true);
  }

  update(entity) {
    this.playerUpdate();
    if (this.body) {
      const diffX = this.body.x - entity.position.x;
      if (Math.abs(diffX) > 1) {
        this.body.setVelocityX(diffX > 0 ? -75 : 75);
      } else {
        this.body.setVelocityX(0);
      }

      const diffY = this.body.y - entity.position.y;
      if (Math.abs(diffY) > 1) {
        this.body.setVelocityY(diffY > 0 ? -75 : 75);
      } else {
        this.body.setVelocityY(0);
      }

      if (this.body.velocity.y > 0) {
        this.playAnim('down');
      } else if (this.body.velocity.x < 0) {
        this.playAnim('left');
      } else if (this.body.velocity.x > 0) {
        this.playAnim('right');
      } else if (this.body.velocity.y < 0) {
        this.playAnim('up');
      } else {
        this.anims.stop();
      }
    }
  }
}

export default Player;
