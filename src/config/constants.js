const ZOOM = 3;
const TILES_WIDTH = Math.floor(window.innerWidth / (32 * ZOOM));
const TILES_HEIGHT = Math.floor(window.innerHeight / (32 * ZOOM));

export default {
  ZOOM,
  TILES_WIDTH,
  TILES_HEIGHT,
  WIDTH: TILES_WIDTH * 32 * ZOOM,
  HEIGHT: TILES_HEIGHT * 32 * ZOOM,
};
