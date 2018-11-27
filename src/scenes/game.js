import Phaser from 'phaser';

import overworldTileset from '../assets/mainTileset.png';
import mapJson from '../assets/map.json';
import char001 from '../assets/char-001.png';
import char002 from '../assets/char-002.png';
import char003 from '../assets/char-003.png';
import char004 from '../assets/char-004.png';
import monster001 from '../assets/monster-001.png';
import monster002 from '../assets/monster-002.png';

import Player from '../objects/Player';
import ControlledPlayer from '../objects/ControlledPlayer';
import state from '../state';
import DEPTH from '../config/depth';

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
    this.load.spritesheet('monster-001', monster001, { frameWidth: 32, frameHeight: 48 });
    this.load.spritesheet('monster-002', monster002, { frameWidth: 40, frameHeight: 56 });
  }

  create() {
    const mainPlayerUID = state.$playerEntity.uid;
    this.buildAnimation(state.$playerEntity);
    state.$players = {
      [mainPlayerUID]: new ControlledPlayer(this, state.$playerEntity),
    };
    state.$mainPlayer = state.$players[mainPlayerUID];

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


    above.setDepth(DEPTH.ABOVE);

    this.physics.add.collider(state.$mainPlayer, playerLayer);
    this.physics.add.collider(state.$mainPlayer, collision);

    // Create player animation
    // this.buildAnimations();

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
      faceColor: new Phaser.Display.Color(40, 39, 37, 255), // Color of colliding face edges
    });
    collision.renderDebug(graphics, {
      tileColor: null, // Color of non-colliding tiles
      collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
      faceColor: new Phaser.Display.Color(40, 39, 37, 255), // Color of colliding face edges
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
    console.log('[Spawn]', e);
    this.buildAnimation(e);
    state.$players[e.uid] = new Player(this, e);
  }

  buildAnimation(entity) {
    console.log('entity', entity)
    const key = entity.type === 'player' ? entity.uid : entity.sprite;
    console.log('key', key)
    if (this.anims.get(`${key}-down`)) return;

    this.anims.create({
      key: `${key}-down`,
      frames: this.anims.generateFrameNumbers(entity.sprite, { start: 0, end: 3 }),
      frameRate: entity.info.speed / 10,
      repeat: -1,
    });

    this.anims.create({
      key: `${key}-left`,
      frames: this.anims.generateFrameNumbers(entity.sprite, { start: 4, end: 7 }),
      frameRate: entity.info.speed / 10,
      repeat: -1,
    });

    this.anims.create({
      key: `${key}-right`,
      frames: this.anims.generateFrameNumbers(entity.sprite, { start: 8, end: 11 }),
      frameRate: entity.info.speed / 10,
      repeat: -1,
    });

    this.anims.create({
      key: `${key}-up`,
      frames: this.anims.generateFrameNumbers(entity.sprite, { start: 12, end: 15 }),
      frameRate: entity.info.speed / 10,
      repeat: -1,
    });
  }

  // buildAnimations() {
  //   const sprites = ['char-001', 'char-002', 'char-003', 'char-004', 'monster-001', 'monster-002'];
  //   sprites.forEach((s) => {
  //     this.anims.create({
  //       key: `${s}-down`,
  //       frames: this.anims.generateFrameNumbers(s, { start: 0, end: 3 }),
  //       frameRate: 6,
  //       repeat: -1,
  //     });

  //     this.anims.create({
  //       key: `${s}-left`,
  //       frames: this.anims.generateFrameNumbers(s, { start: 4, end: 7 }),
  //       frameRate: 6,
  //       repeat: -1,
  //     });

  //     this.anims.create({
  //       key: `${s}-right`,
  //       frames: this.anims.generateFrameNumbers(s, { start: 8, end: 11 }),
  //       frameRate: 6,
  //       repeat: -1,
  //     });

  //     this.anims.create({
  //       key: `${s}-up`,
  //       frames: this.anims.generateFrameNumbers(s, { start: 12, end: 15 }),
  //       frameRate: 6,
  //       repeat: -1,
  //     });
  //   })
  // }

}

export default Game;
