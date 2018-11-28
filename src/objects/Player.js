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
    this.uid = args.uid;
    this.sprite = args.sprite;
    this.level = args.level;
    this.name = args.name;
    this.serverMovement = args.movement;
    this.speed = args.speed;
    this.type = args.type;
    this.key = this.type === ENTITY.PLAYER ? this.uid : this.sprite;

    // Spawn child objects
    this.text = game.add.text(0, 0, `[${this.level}] ${this.name}`, { align: 'center', color: '#00ef00', fontSize: '8px', fontFamily: 'Tahoma', stroke: 'black', strokeThickness: 1, resolution: 3 });
    this.text.setDepth(DEPTH.TEXT);

    // Set sprite origin
    this.setOrigin(0, 0.5);
  }

  playerUpdate(time, delta) {
    // Move towards position from server
    const result = Movement.moveTowards(this, this.serverMovement, delta);

    // Play animation going towards position
    this.playAnim(result);

    // Reposition text
    this.text.x = (this.x + (this.width / 2)) - Math.round(this.text.width / 2);
    this.text.y = this.y - (this.height - 12);

    // Reorder player depth
    this.setDepth(DEPTH.BASE + (this.y / 32));
  }

  playAnim(direction) {
    // Play animation by name
    if (direction === 'none') return;
    this.anims.play(`${this.key}-${direction}`, true);
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
