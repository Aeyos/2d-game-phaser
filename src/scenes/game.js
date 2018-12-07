// PACKAGES
import Phaser from 'phaser';
// LOCALS
import ControlledPlayer from '../objects/ControlledPlayer';
import MousePointer from '../objects/MousePointer';
import Entity from '../objects/Entity';
import State from '../State';
import DEPTH from '../config/depth';

class Game extends Phaser.Scene {
  constructor() {
    super({ key: 'Game' });
  }

  preload() {
    this.load.baseURL = 'http://localhost/public/';
    this.load.image('tiles', 'mainTileset.png');
    this.load.tilemapTiledJSON('map', 'map.json');
    this.load.spritesheet('char-001', 'char-001.png', { frameWidth: 32, frameHeight: 48 });
    this.load.spritesheet('char-002', 'char-002.png', { frameWidth: 32, frameHeight: 48 });
    this.load.spritesheet('char-003', 'char-003.png', { frameWidth: 32, frameHeight: 48 });
    this.load.spritesheet('char-004', 'char-004.png', { frameWidth: 32, frameHeight: 48 });
    this.load.spritesheet('monster-001', 'monster-001.png', { frameWidth: 32, frameHeight: 48 });
    this.load.spritesheet('monster-002', 'monster-002.png', { frameWidth: 40, frameHeight: 56 });
    this.load.spritesheet('monster_dragon', 'monster_dragon.png', { frameWidth: 96, frameHeight: 96 });
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
    console.log('State.$playerEntity', State.$playerEntity);
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
    State.$socket.emit('update', State.$mainPlayer.getPacket(), (response) => {
      this.createEntities(response.entities);
      this.updateEntities(response);
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

  updateEntities(response) { // eslint-disable-line class-methods-use-this
    response.journal.forEach((e) => {
      State.$entities[e.target.uid].results.push(e);
    });

    State.$mainPlayer.results.push(...response.result);

    const entityMap = response.entities.reduce((a, v) => ({ ...a, [v.uid]: v }), {});

    Object.entries(State.$entities).forEach((pair) => {
      const entity = entityMap[pair[0]];
      if (entity) {
        pair[1].serverUpdate(entity);
      } else {
        pair[1].kill();
      }
    });
  }

  spawnPlayer(e) {
    console.log('[Spawn]', e);
    State.$entities[e.uid] = new Entity(this, e);
  }
}

export default Game;
