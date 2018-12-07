import Phaser from 'phaser';
import { Actions as ACTIONS, Entity as ENTITY } from 'game-defs';

import Movement from '../utils/Movement';
import State from '../State';

import DEPTH from '../config/depth';

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

    this.setInteractive().on('pointerdown', this.onClick);

    this.damages = [];

    this.game = game;
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

  playDamage(damage) {
    const obj = this.game.add.text(this.x, this.y, `♥ ${damage}`, {
      align: 'center',
      color: '#FF3333',
      fontSize: '8px',
      fontFamily: 'Tahoma',
      stroke: '#450000',
      strokeThickness: 2,
      resolution: 3,
    });

    obj.setOrigin(0.5, 1);
    obj.setDepth(DEPTH.DAMAGE);
    obj.timeElapsed = 0;

    this.damages.push(obj);
  }

  update(time, delta) {
    // Reposition text
    this.updateText();

    // Update damage indicators
    this.updateDamage(delta);

    // No need to update dead enemies
    if (this.killed) return;

    // Move towards position from server
    const result = Movement.moveTowards(this, this.serverMovement, delta);

    // Play animation going towards position
    this.playAnim(result, delta);

    // Reorder player depth
    this.setDepth(DEPTH.BASE + (this.y / 32));
  }

  updateText() {
    this.text.setText(`[${this.level}] ${this.name}\n♥ ${this.hp}`);
    this.text.x = this.x + 16;
    this.text.y = this.y - (this.height - 24);
  }

  updateDamage(delta) {
    this.damages.forEach((d) => {
      if (d.timeElapsed > 1.5) {
        this.damages.splice(this.damages.indexOf(d), 1);
        d.destroy();
      } else {
        d.x = this.x + 16;
        d.y = this.y - (this.height - 24) - Math.round(d.timeElapsed * 20);
        d.timeElapsed = d.timeElapsed + delta;
      }
    });
  }

  kill() {
    this.text.destroy();
    this.killed = true;
    this.setDepth(DEPTH.BODIES);
    this.playAnim('none', 999999);
    this.handleEvents(this.results);
  }

  handleEvents(events) {
    events.forEach((a) => {
      switch (a.type) {
        case ACTIONS.DAMAGE:
          this.playDamage(a.damage);
          break;
        case ACTIONS.KILL:
          this.angle = 90;
          break;
        default:
          break;
      }
    });

    delete this.results;
    this.results = [];
  }

  // Get update from server
  serverUpdate(entity) {
    this.handleEvents(this.results);

    // Grab server entity position
    this.serverMovement = entity.movement;
    this.hp = entity.hp;
  }
}
