import Phaser from 'phaser';
import { Actions as ACTIONS } from 'game-defs';

import Movement from '../utils/Movement';
import State from '../State';

import DEPTH from '../config/depth';
import ENTITY from '../types/Entity';

export default class Entity extends Phaser.GameObjects.Sprite {
  constructor(game, args = {}) {
    // Create object
    super(game, args.movement.position.x || 0, args.movement.position.y || 0, args.sprite || 'char');

    // Add existing object to scene
    game.add.existing(this);

    // Add custom properties
    const { movement, ...data } = args;

    Object.assign(this, data);

    this.serverMovement = movement;
    this.maxHp = args.hp;
    this.animationKey = this.type === ENTITY.PLAYER ? this.uid : this.sprite;
    this.meta = {
      moveTimer: 0,
    };
    this.results = [];

    // Build animations
    this.buildAnimation();

    // Spawn child objects
    this.text = game.add.text(0, 0, '', { // \n⚔ ${this.atk} - ⛨ ${this.def}
      align: 'center',
      color: '#00ef00',
      fontSize: '8px',
      fontFamily: 'Tahoma',
      stroke: '#004500',
      strokeThickness: 2,
      resolution: 3,
    });
    this.text.setOrigin(0.5, 1);
    this.text.setDepth(DEPTH.TEXT);

    // Set sprite origin
    this.setOrigin(((this.width - 32) / 2) / this.width, 1 - (24 / this.height));

    this.setInteractive()
      .on('pointerdown', this.onClick);
  }

  // EVENT HANDLERS
  onClick() {
    if (!this.mainPlayer) {
      State.$mainPlayer.setTarget(this);
    }
  }

  // OTHER METHODS

  buildAnimation() {
    if (this.anims.animationManager.get(`${this.animationKey}-down`)) {
      return;
    }

    this.anims.animationManager.create({
      key: `${this.animationKey}-down`,
      frames: this.anims.animationManager.generateFrameNumbers(this.sprite, { start: 0, end: 3 }),
      frameRate: this.speed * 2,
      repeat: -1,
    });

    this.anims.animationManager.create({
      key: `${this.animationKey}-left`,
      frames: this.anims.animationManager.generateFrameNumbers(this.sprite, { start: 4, end: 7 }),
      frameRate: this.speed * 2,
      repeat: -1,
    });

    this.anims.animationManager.create({
      key: `${this.animationKey}-right`,
      frames: this.anims.animationManager.generateFrameNumbers(this.sprite, { start: 8, end: 11 }),
      frameRate: this.speed * 2,
      repeat: -1,
    });

    this.anims.animationManager.create({
      key: `${this.animationKey}-up`,
      frames: this.anims.animationManager.generateFrameNumbers(this.sprite, { start: 12, end: 15 }),
      frameRate: this.speed * 2,
      repeat: -1,
    });
  }

  playAnim(direction, delta) {
    // Play animation by name
    if (direction === 'none') {
      if (this.meta.moveTimer > 0.05) {
        this.anims.stop(null, true);
      }
    } else {
      this.meta.moveTimer = 0;
      this.anims.play(`${this.animationKey}-${direction}`, true);
    }

    this.meta.moveTimer += delta;
  }

  update(time, delta) {
    // Move towards position from server
    const result = Movement.moveTowards(this, this.serverMovement, delta);

    // Play animation going towards position
    this.playAnim(result, delta);

    // Reposition text
    this.updateText();

    // Reorder player depth
    this.setDepth(DEPTH.BASE + (this.y / 32));
  }

  updateText() {
    this.text.setText(`[${this.level}] ${this.name}\n♥ ${this.hp}`);
    this.text.x = this.x + 16;
    this.text.y = this.y - (this.height - 24);
  }

  // Get update from server
  serverUpdate(entity) {
    this.results.forEach((a) => {
      switch (a.type) {
        case ACTIONS.DAMAGE:
          console.log(`${this.name}(${a.target.name}) took ${a.damage} from ${a.source.name}`);
          break;
        default:
          break;
      }
    });

    // Grab server entity position
    this.serverMovement = entity.movement;
    this.hp = entity.hp;

    delete this.results;
    this.results = [];
  }
}
