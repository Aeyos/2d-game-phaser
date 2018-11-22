import Phaser from 'phaser';

import overworldTileset from '../assets/mainTileset.png';
import mapJson from '../assets/map.json';
import char from '../assets/char_4.png';

import ControlledPlayer from '../objects/ControlledPlayer';

class Game extends Phaser.Scene {
  constructor() {
    super({ key: 'Game' });
  }

  preload() {
    this.load.image('tiles', overworldTileset);
    this.load.tilemapTiledJSON('map', mapJson);
    this.load.spritesheet('char', char, { frameWidth: 32, frameHeight: 48 });
  }

  create() {
    this.$state = {};
    this.$state.mainPlayer = new ControlledPlayer(this, { x: 768, y: 768 });

    const map = this.make.tilemap({ key: 'map' });
    const tileset = map.addTilesetImage('mainTileset', 'tiles');

    const terrain = map.createStaticLayer('Terrain', tileset, 0, 0);
    const terrainDecoration = map.createStaticLayer('TerrainDecoration', tileset, 0, 0);
    const terrainDetails = map.createStaticLayer('TerrainDetails', tileset, 0, 0);
    const playerLayer = map.createStaticLayer('PlayerLayer', tileset, 0, 0);
    const above = map.createStaticLayer('Above', tileset, 0, 0);
    const collision = map.createStaticLayer('Collision', tileset, 0, 0);

    playerLayer.setCollisionByProperty({ collides: true });
    collision.setCollisionByProperty({ collides: true });


    above.setDepth(20);

    this.physics.add.collider(this.$state.mainPlayer, playerLayer);
    this.physics.add.collider(this.$state.mainPlayer, collision);
    
    // Create player animation
    
    this.anims.create({
      key: 'down',
      frames: this.anims.generateFrameNumbers('char', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('char', { start: 4, end: 7 }),
      frameRate: 10,
      repeat: -1,
    });
    
    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('char', { start: 8, end: 11 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: 'up',
      frames: this.anims.generateFrameNumbers('char', { start: 12, end: 15 }),
      frameRate: 10,
      repeat: -1,
    });

    this.cameras.main.zoom = 3;



            // Turn on physics debugging to show player's hitbox
            this.physics.world.createDebugGraphic();
        
            // Create worldLayer collision graphic above the player, but below the help text
            const graphics = this.add
            .graphics()
            .setAlpha(0.75)
            .setDepth(20);

            playerLayer.renderDebug(graphics, {
                tileColor: null, // Color of non-colliding tiles
                collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
                faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
            });
            collision.renderDebug(graphics, {
                tileColor: null, // Color of non-colliding tiles
                collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
                faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
            });
    // this.player.scaleX = this.player.scaleY;
  }

  update(time, deltaMsec) {
    const delta = deltaMsec / 1000;
    // Create movement controller
    this.cursors = this.input.keyboard.createCursorKeys();

    this.$state.mainPlayer.update(time, delta);
  }
}

export default Game;
