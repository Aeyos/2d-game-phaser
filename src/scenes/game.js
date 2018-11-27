// PACKAGES
import Phaser from 'phaser';
// LOCALS
import ControlledPlayer from '../objects/ControlledPlayer';
import DEPTH from '../config/depth';
import Player from '../objects/Player';
import State from '../State';
// ASSETS
import char001 from '../assets/char-001.png';
import char002 from '../assets/char-002.png';
import char003 from '../assets/char-003.png';
import char004 from '../assets/char-004.png';
import monster001 from '../assets/monster-001.png';
import monster002 from '../assets/monster-002.png';
import mapJson from '../assets/map.json';
import overworldTileset from '../assets/mainTileset.png';

class Game extends Phaser.Scene {
  constructor() {
    super({ key: 'Game' });
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
    // SOCKET EVENT BINDING
    State.$socket.on('broadcast', (msg) => {
      console.log('broadcast', msg);
    });

    State.$socket.on('message', (msg) => {
      console.log('message', msg);
    });

    State.$socket.on('update', (data) => {
      this.updateFromServer(data);
    });

    // CREATE MAIN PLAYER
    const mainPlayerUID = State.$playerEntity.uid;
    State.$players = {
      [mainPlayerUID]: new ControlledPlayer(this, State.$playerEntity),
    };
    State.$mainPlayer = State.$players[mainPlayerUID];
    this.buildAnimation(State.$playerEntity);

    // BUILD MAP
    const map = this.make.tilemap({ key: 'map' });
    const tileset = map.addTilesetImage('mainTileset', 'tiles');

    this.layers = {
      terrain: map.createStaticLayer('Terrain', tileset, 0, 0),
      terrainDecoration: map.createStaticLayer('TerrainDecoration', tileset, 0, 0),
      terrainDetails: map.createStaticLayer('TerrainDetails', tileset, 0, 0),
      playerLayer: map.createStaticLayer('PlayerLayer', tileset, 0, 0),
      above: map.createStaticLayer('Above', tileset, 0, 0),
    };

    console.log('map', map)
    console.log('tileset', tileset)
    console.log('this.layers', this.layers)

    // PHYSICS
    // playerLayer.setCollisionByProperty({ collides: true });
    // collision.setCollisionByProperty({ collides: true });
    // this.physics.add.collider(State.$mainPlayer, playerLayer);
    // this.physics.add.collider(State.$mainPlayer, collision);
    // this.physics.world.createDebugGraphic();

    // DEPTH SORTING
    this.layers.above.setDepth(DEPTH.ABOVE);

    // CAMERA SETUP
    this.cameras.main.zoom = 3;

    // DEBUG
    // const graphics = this.add
    //   .graphics()
    //   .setAlpha(0.75)
    //   .setDepth(20);
    // playerLayer.renderDebug(graphics, {
    //   tileColor: null, // Color of non-colliding tiles
    //   collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
    //   faceColor: new Phaser.Display.Color(40, 39, 37, 255), // Color of colliding face edges
    // });
    // collision.renderDebug(graphics, {
    //   tileColor: null, // Color of non-colliding tiles
    //   collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
    //   faceColor: new Phaser.Display.Color(40, 39, 37, 255), // Color of colliding face edges
    // });
  }

  update(time, deltaMsec) {
    const delta = deltaMsec / 1000;
    // Create movement controller
    this.cursors = this.input.keyboard.createCursorKeys();

    Object.values(State.$players).forEach((p) => {
      p.update(time, delta);
    });

    this.talkToServer();
  }

  talkToServer() {
    State.$socket.emit('update', State.$mainPlayer.getPacket(), (entities) => {
      this.createEntities(entities);
      this.updateEntities(entities);
      this.deleteEntities(entities);
    });
  }

  createEntities(entities) {
    // @todo: add case for other entities
    entities.forEach((e) => {
      if (!State.$players[e.uid] && e.uid) {
        this.spawnPlayer(e);
      }
    });
  }

  updateEntities(entities) {
    entities.forEach(e => {
      State.$players[e.uid].serverUpdate(e);
    });
  }

  deleteEntities(entities) {
    // PLACEHOLDER
  }

  spawnPlayer(e) {
    console.log('[Spawn]', e);
    this.buildAnimation(e);
    State.$players[e.uid] = new Player(this, e);
  }

  buildAnimation(entity) {
    const key = entity.type === 'player' ? entity.uid : entity.sprite;
    if (this.anims.get(`${key}-down`)) return;

    this.anims.create({
      key: `${key}-down`,
      frames: this.anims.generateFrameNumbers(entity.sprite, { start: 0, end: 3 }),
      frameRate: entity.info.speed * 2,
      repeat: -1,
    });

    this.anims.create({
      key: `${key}-left`,
      frames: this.anims.generateFrameNumbers(entity.sprite, { start: 4, end: 7 }),
      frameRate: entity.info.speed * 2,
      repeat: -1,
    });

    this.anims.create({
      key: `${key}-right`,
      frames: this.anims.generateFrameNumbers(entity.sprite, { start: 8, end: 11 }),
      frameRate: entity.info.speed * 2,
      repeat: -1,
    });

    this.anims.create({
      key: `${key}-up`,
      frames: this.anims.generateFrameNumbers(entity.sprite, { start: 12, end: 15 }),
      frameRate: entity.info.speed * 2,
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
