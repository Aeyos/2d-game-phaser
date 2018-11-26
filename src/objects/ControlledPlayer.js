import Player from './Player';

class ControlledPlayer extends Player {
  constructor(game, args = {}) {
    super(game, args);

    game.cameras.main.startFollow(this);
  }

  update(time, delta) {
    this.body.setVelocity(0);
    if (this.scene.cursors.down.isDown) {
      this.anims.play(`${this.sprite}-down`, true);
      this.body.setVelocityY(200);
    } else if (this.scene.cursors.left.isDown) {
      this.anims.play(`${this.sprite}-left`, true);
      this.body.setVelocityX(-200);
    } else if (this.scene.cursors.right.isDown) {
      this.anims.play(`${this.sprite}-right`, true);
      this.body.setVelocityX(200);
    } else if (this.scene.cursors.up.isDown) {
      this.anims.play(`${this.sprite}-up`, true);
      this.body.setVelocityY(-200);
    } else {
      this.anims.stop();
      this.body.setVelocityX(0);
      this.body.setVelocityY(0);
    }
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
