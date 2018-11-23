import Phaser from 'phaser';

import overworldTileset from '../assets/mainTileset.png';
import mapJson from '../assets/map.json';
import char from '../assets/char_4.png';
import undead0 from '../assets/undead_0.png';
import undead1 from '../assets/monster_dragon.png';

import Player from '../objects/Player';
import ControlledPlayer from '../objects/ControlledPlayer';

class Game extends Phaser.Scene {
  constructor() {
    super({ key: 'Game' });

    setInterval(() => this.sendUpdateToServer(), 50);
  }

  preload() {
    this.load.image('tiles', overworldTileset);
    this.load.tilemapTiledJSON('map', mapJson);
    this.load.spritesheet('char', char, { frameWidth: 32, frameHeight: 48 });
    this.load.spritesheet('undead0', undead0, { frameWidth: 32, frameHeight: 48 });
    this.load.spritesheet('undead1', undead1, { frameWidth: 96, frameHeight: 96 });
  }

  create() {
    this.$state = {};
    this.$state.mainPlayer = new ControlledPlayer(this, { x: 768, y: 768 });
    this.$state.players = [
      new Player(this, { x: 800, y: 800 }),
    ];

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
    this.$state.players[0].update(time, delta);
  }

  updateFromServer(data) {
    console.log('data', data)
    this.$state.players[0].body.reset(data[1].x, data[1].y);
  }

  sendUpdateToServer() {
    if (window && window.$socket) {
      window.$socket.emit('update', this.$state.mainPlayer.getPacket());
    }
  }
}

export default Game;
