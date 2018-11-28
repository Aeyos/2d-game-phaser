class Movement {
  static moveTowards(obj, movement, delta) {
    if (new Date().getTime() > (movement.moveStart + movement.duration)) return 'none';

    const deltaTime = new Date().getTime() - movement.moveStart;
    const percent = deltaTime / movement.duration;
    const x = Math.round(movement.from.x + ((movement.position.x - movement.from.x) * percent));
    const y = Math.round(movement.from.y + ((movement.position.y - movement.from.y) * percent));

    Object.assign(obj, { x, y });

    return 'none';
  }
}

export default Movement;
