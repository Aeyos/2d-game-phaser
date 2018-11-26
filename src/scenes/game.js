import Phaser from 'phaser';

import overworldTileset from '../assets/mainTileset.png';
import mapJson from '../assets/map.json';
import char001 from '../assets/char-001.png';
import char002 from '../assets/char-002.png';
import char003 from '../assets/char-003.png';
import char004 from '../assets/char-004.png';
import undead0 from '../assets/undead_0.png';
import undead1 from '../assets/monster_dragon.png';

import Player from '../objects/Player';
import ControlledPlayer from '../objects/ControlledPlayer';
import state from '../state';

class Game extends Phaser.Scene {
  constructor() {
    super({ key: 'Game' });

    // setInterval(() => this.sendUpdateToServer(), 50);
  }

  preload() {
    this.load.image('tiles', overworldTileset);
    this.load.tilemapTiledJSON('map', mapJson);
    this.load.spritesheet('char-001', char001, { frameWidth: 32, frameHeight: 48 });
    this.load.spritesheet('char-002', char002, { frameWidth: 32, frameHeight: 48 });
    this.load.spritesheet('char-003', char003, { frameWidth: 32, frameHeight: 48 });
    this.load.spritesheet('char-004', char004, { frameWidth: 32, frameHeight: 48 });
    this.load.spritesheet('undead0', undead0, { frameWidth: 32, frameHeight: 48 });
    this.load.spritesheet('undead1', undead1, { frameWidth: 96, frameHeight: 96 });
  }

  create() {
    state.$players = {
      [state.uid]: new ControlledPlayer(this, { x: 768, y: 768, uid: state.uid }),
    };
    state.$mainPlayer = state.$players[state.uid];

    state.$socket.on('broadcast', (msg) => {
      console.log('broadcast', msg);
    });

    state.$socket.on('message', (msg) => {
      console.log('message', msg);
    });

    state.$socket.on('update', (data) => {
      this.updateFromServer(data);
    });

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

    this.physics.add.collider(state.$mainPlayer, playerLayer);
    this.physics.add.collider(state.$mainPlayer, collision);

    // Create player animation
    this.buildAnimations();

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

    state.$mainPlayer.update(time, delta);

    this.talkToServer();
  }

  talkToServer() {
    state.$socket.emit('update', state.$mainPlayer.getPacket(), (entities) => {
      console.log('entities', entities);
      this.createEntities(entities);
      this.updateEntities(entities);
      this.deleteEntities(entities);
    });
  }

  createEntities(entities) {
    // @todo: add case for other entities
    entities.forEach((e) => {
      if (!state.$players[e.uid] && e.uid) {
        this.spawnPlayer(e);
      }
    });
  }

  updateEntities(entities) {
    entities.forEach(e => {
      state.$players[e.uid].update(e);
    });
  }

  deleteEntities(entities) {
    // PLACEHOLDER
  }

  spawnPlayer(e) {
    state.$players[e.uid] = new Player(this, { ...e.position, ...e.info });
  }

  buildAnimations() {
    const sprites = ['char-001', 'char-002', 'char-003', 'char-004'];
    sprites.forEach((s) => {
      this.anims.create({
        key: 'down',
        frames: this.anims.generateFrameNumbers(s, { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1,
      });

      this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers(s, { start: 4, end: 7 }),
        frameRate: 10,
        repeat: -1,
      });

      this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers(s, { start: 8, end: 11 }),
        frameRate: 10,
        repeat: -1,
      });

      this.anims.create({
        key: 'up',
        frames: this.anims.generateFrameNumbers(s, { start: 12, end: 15 }),
        frameRate: 10,
        repeat: -1,
      });
    })
  }

}

export default Game;
