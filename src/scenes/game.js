// PACKAGES
import Phaser from 'phaser';
// LOCALS
import ControlledPlayer from '../objects/ControlledPlayer';
import MousePointer from '../objects/MousePointer';
import Entity from '../objects/Entity';
import State from '../State';
import DEPTH from '../config/depth';

// ASSETS
import char001 from '../assets/char-001.png';
import char002 from '../assets/char-002.png';
import char003 from '../assets/char-003.png';
import char004 from '../assets/char-004.png';
import monster001 from '../assets/monster-001.png';
import monster002 from '../assets/monster-002.png';
import monsterDragon from '../assets/monster_dragon.png';
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
    this.load.spritesheet('monster_dragon', monsterDragon, { frameWidth: 96, frameHeight: 96 });
  }

  create() {
    // STATE
    State.$camera = this.cameras.main;
    State.$mouse = this.input.mousePointer;
    State.$scene = this;

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
    console.log('State.$playerEntity', State.$playerEntity)
    const mainPlayerUID = State.$playerEntity.uid;
    State.$entities = {
      [mainPlayerUID]: new ControlledPlayer(this, State.$playerEntity),
    };
    State.$mainPlayer = State.$entities[mainPlayerUID];
    State.$mouseTracker = new MousePointer();

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

    // DEPTH SORTING
    this.layers.above.setDepth(DEPTH.ABOVE);

    // CAMERA SETUP
    this.cameras.main.zoom = 3;
    this.cameras.main.setBounds(0, 0, map.width * 32, map.height * 32);
  }

  update(time, deltaMsec) {
    const delta = deltaMsec / 1000;
    // Create movement controller
    this.cursors = this.input.keyboard.createCursorKeys();

    Object.values(State.$entities).forEach((p) => {
      p.update(time, delta);
    });

    State.$mouseTracker.update();

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
      if (!State.$entities[e.uid] && e.uid) {
        this.spawnPlayer(e);
      }
    });
  }

  updateEntities(entities) {
    entities.forEach(e => {
      State.$entities[e.uid].serverUpdate(e);
    });
  }

  deleteEntities(entities) {
    // PLACEHOLDER
  }

  spawnPlayer(e) {
    console.log('[Spawn]', e);
    State.$entities[e.uid] = new Entity(this, e);
  }
}

export default Game;
