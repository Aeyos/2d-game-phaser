import Player from './Player';

class ControlledPlayer extends Player {
  constructor(game, args = {}) {
    super(game, args);

    this.game = game;
    this.to = { x: args.position.x, y: args.position.y };
    this.speedCooldown = 0;

    game.cameras.main.startFollow(this);
  }

  update(time, delta) {
    this.playerUpdate(time, delta);

    this.speedCooldown -= delta;
    if (this.speedCooldown <= 0) {
      if (this.scene.cursors.down.isDown) {
        this.to.y += 32;
        this.speedCooldown = 1 / this.speed;
      } else if (this.scene.cursors.left.isDown) {
        this.to.x -= 32;
        this.speedCooldown = 1 / this.speed;
      } else if (this.scene.cursors.right.isDown) {
        this.to.x += 32;
        this.speedCooldown = 1 / this.speed;
      } else if (this.scene.cursors.up.isDown) {
        this.to.y -= 32;
        this.speedCooldown = 1 / this.speed;
      }
    }

    // // Fake server entity move based on player input
    // this.playerUpdate(entity);

    this.game.cameras.main.x = 1 - (this.x % 1);
    this.game.cameras.main.y = 1 - (this.y % 1);
  }

  getPacket() {
    return {
      move: { x: this.to.x, y: this.to.y },
      // attack: { entityID, equipID },
      // grab: { entityID },
      // use: { entityID, equipID },
    };
  }
}

export default ControlledPlayer;
