import Player from './Player';

class ControlledPlayer extends Player {
  constructor(game, args = {}) {
    super(game, args);

    this.game = game;

    game.cameras.main.startFollow(this);
  }

  update(time, delta) {
    this.playerUpdate();
    this.body.setVelocity(0);

    if (this.scene.cursors.down.isDown) {
      this.playAnim('down');
      this.body.setVelocityY(this.speed);
    } else if (this.scene.cursors.left.isDown) {
      this.playAnim('left');
      this.body.setVelocityX(-this.speed);
    } else if (this.scene.cursors.right.isDown) {
      this.playAnim('right');
      this.body.setVelocityX(this.speed);
    } else if (this.scene.cursors.up.isDown) {
      this.playAnim('up');
      this.body.setVelocityY(-this.speed);
    } else {
      this.anims.stop();
      this.body.setVelocityX(0);
      this.body.setVelocityY(0);
    }

    this.game.cameras.main.x = 1 - (this.body.position.x % 1);
    this.game.cameras.main.y = 1 - (this.body.position.y % 1);
  }

  getPacket() {
    return {
      move: { x: this.body.position.x, y: this.body.position.y },
      // attack: { entityID, equipID },
      // grab: { entityID },
      // use: { entityID, equipID },
    };
  }
}

export default ControlledPlayer;
