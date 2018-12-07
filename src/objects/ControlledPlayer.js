import Phaser from 'phaser';
import { Actions as ACTIONS } from 'game-defs';

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
    this.actions = [];
    this.mainPlayer = true;

    game.cameras.main.startFollow(this);

    // TARGET INDICATOR
    this.rect = new Phaser.Geom.Rectangle(-32, -32, 32, 32);
    this.graphics = State.$scene.add.graphics({ lineStyle: { color: 0xFF0000 } });
    this.graphics.setDepth(DEPTH.ACTION_CURSOR);
  }

  // Create request to move player, but don't move yet
  displace(x, y) {
    // Set new position
    this.to.x -= x;
    this.to.y += y;

    // Set move cooldown
    this.speedCooldown = 1 / this.speed;

    // Append action to array
    this.actions.push({
      x: this.to.x,
      y: this.to.y,
      type: ACTIONS.MOVEMENT,
      timestamp: new Date().getTime(),
    });
  }

  attack() {
    if (this.target) {
      this.attackCooldown = 1 / this.atk_speed;

      // Append action to array
      this.actions.push({
        target: this.target.uid,
        type: ACTIONS.ATTACK,
        timestamp: new Date().getTime(),
      });
    }
  }

  update(time, delta) {
    super.update(time, delta);

    this.speedCooldown -= delta;
    this.attackCooldown -= delta;

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

    if (this.attackCooldown <= 0) {
      this.attack();
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
    // this.to = entity.movement;
    this.results.forEach((a) => {
      switch (a.type) {
        case ACTIONS.MOVEMENT:
          if (!a.didPerform) {
            this.to.x = entity.movement.position.x;
            this.to.y = entity.movement.position.y;
            this.speedCooldown = 0;
          }
          break;
        case ACTIONS.ATTACK:
          if (!a.didPerform) {
            this.attackCooldown = 0;
          }
          break;
        default:
          break;
      }
    });

    super.serverUpdate(entity);
  }

  getPacket() {
    const returnArr = this.actions;
    this.actions = [];
    return returnArr;
  }

  setTarget(entity) {
    this.target = entity;
  }
}

export default ControlledPlayer;
