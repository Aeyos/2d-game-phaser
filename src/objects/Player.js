import Phaser from 'phaser';

import Movement from '../utils/Movement';
import DEPTH from '../config/depth';
import ENTITY from '../types/Entity';

class Player extends Phaser.GameObjects.Sprite {
  constructor(game, args = {}) {
    // Create object
    super(game, args.movement.position.x || 0, args.movement.position.y || 0, args.sprite || 'char');

    // Add existing object to scene
    game.add.existing(this);

    // Add custom properties
    this.level = args.level;
    this.name = args.name;
    this.serverMovement = args.movement;
    this.speed = args.speed;
    this.sprite = args.sprite;
    this.type = args.type;
    this.uid = args.uid;
    this.animationKey = this.type === ENTITY.PLAYER ? this.uid : this.sprite;
    this.meta = {
      moveTimer: 0,
    };

    // Build animations
    this.buildAnimation();

    // Spawn child objects
    this.text = game.add.text(0, 0, `[${this.level}] ${this.name}`, {
      align: 'center',
      color: '#00ef00',
      fontSize: '8px',
      fontFamily: 'Tahoma',
      stroke: 'black',
      strokeThickness: 1,
      resolution: 3,
    });
    this.text.setDepth(DEPTH.TEXT);

    // Set sprite origin
    this.setOrigin(0, 0.5);
  }

  buildAnimation() {
    if (this.anims.animationManager.get(`${this.animationKey}-down`)) return;

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

  playerUpdate(time, delta) {
    // Move towards position from server
    const result = Movement.moveTowards(this, this.serverMovement, delta);

    // Play animation going towards position
    this.playAnim(result, delta);

    // Reposition text
    this.text.x = (this.x + (this.width / 2)) - Math.round(this.text.width / 2);
    this.text.y = this.y - (this.height - 12);

    // Reorder player depth
    this.setDepth(DEPTH.BASE + (this.y / 32));
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

  // Get update from server
  serverUpdate(entity) {
    // Grab server entity position
    this.serverMovement = entity.movement;
  }

  update(...args) {
    // Update generic player
    this.playerUpdate(...args);
  }
}

export default Player;
