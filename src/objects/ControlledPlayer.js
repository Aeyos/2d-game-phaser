import Player from './Player';

class ControlledPlayer extends Player {
  constructor(game, args = {}) {
    super(game, args);

    this.game = game;
    this.to = { x: args.movement.position.x, y: args.movement.position.y };
    this.speedCooldown = 0;
    this.actions = { moved: false };

    game.cameras.main.startFollow(this);
  }

  displace(x, y) {
    this.to.x -= x;
    this.to.y += y;
    this.speedCooldown = 1 / this.speed;
    this.actions.moved = true;
  }

  update(time, delta) {
    super.update(time, delta);

    this.speedCooldown -= delta;
    if (this.speedCooldown <= 0) {
      if (this.scene.cursors.down.isDown) {
        this.displace(0, 32);
      } else if (this.scene.cursors.left.isDown) {
        this.displace(32, 0);
      } else if (this.scene.cursors.right.isDown) {
        this.displace(-32, 0);
      } else if (this.scene.cursors.up.isDown) {
        this.displace(0, -32);
      }
    }
    // this.game.cameras.main.x = 1 - (this.x % 1);
    // this.game.cameras.main.y = 1 - (this.y % 1);
  }

  // Get update from server
  serverUpdate(entity) {
    if (entity.actions.moved === 0) {
      this.to = { x: this.x, y: this.y };
      this.speedCooldown = 0;
    }
    super.serverUpdate(entity);
  }

  getPacket() {
    const packet = {};

    if (this.actions.moved) {
      packet.move = { x: this.to.x, y: this.to.y };
      this.actions.moved = false;
    }

    return packet;
  }
}

export default ControlledPlayer;
