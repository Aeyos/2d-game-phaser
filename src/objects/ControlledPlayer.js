import Phaser from 'phaser';

import Player from './Entity';
import State from '../State';

import DEPTH from '../config/depth';

class ControlledPlayer extends Player {
  constructor(game, args = {}) {
    super(game, args);

    this.game = game;
    this.to = { x: args.movement.position.x, y: args.movement.position.y };
    this.speedCooldown = 0;
    this.attackCooldown = 0;
    this.actions = { moved: false };
    this.mainPlayer = true;

    game.cameras.main.startFollow(this);

    // TARGET INDICATOR
    this.rect = new Phaser.Geom.Rectangle(-32, -32, 32, 32);
    this.graphics = State.$scene.add.graphics({ lineStyle: { color: 0xFF0000 } });
    this.graphics.setDepth(DEPTH.ACTION_CURSOR);
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

    this.attackCooldown -= delta;
    if (this.attackCooldown <= 0) {
      if (this.target) {
        this.attackCooldown = 1 / this.atk_speed;
        this.actions.attacked = true;
      }
    }

    this.updateTarget();
  }

  updateTarget() {
    this.graphics.clear();

    if (!this.target) return;

    this.rect.x = this.target.x;
    this.rect.y = this.target.y;
    this.graphics.strokeRectShape(this.rect);
  }

  // Get update from server
  serverUpdate(entity) {
    if (entity.actions.moved === 0) {
      this.to = { x: this.x, y: this.y };
      this.speedCooldown = 0;
    }

    if (entity.actions.attacked === 0) {
      this.attackCooldown = 0;
    } else {
      // play attack animation with damage
      console.log('attack successful')
    }

    super.serverUpdate(entity);
  }

  getPacket() {
    const packet = {};

    if (this.actions.moved) {
      packet.move = { x: this.to.x, y: this.to.y };
      this.actions.moved = false;
    }

    if (this.actions.attacked && this.target) {
      packet.attack = { entityUID: this.target.uid };
      this.actions.attacked = false;
    }

    return packet;
  }

  setTarget(entity) {
    this.target = entity;
  }
}

export default ControlledPlayer;
