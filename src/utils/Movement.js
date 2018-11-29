class Movement {
  static moveTowards(obj, movement, delta) {
    // if (new Date().getTime() > (movement.moveStart + movement.duration)) return 'none';

    let direction = 'none';

    const deltaTime = new Date().getTime() - movement.moveStart;
    const percent = Math.min(1, deltaTime / movement.duration);

    const x = Math.round(movement.from.x + ((movement.position.x - movement.from.x) * percent));
    const y = Math.round(movement.from.y + ((movement.position.y - movement.from.y) * percent));

    if (x > obj.x) direction = 'right';
    if (x < obj.x) direction = 'left';
    if (y > obj.y) direction = 'down';
    if (y < obj.y) direction = 'up';

    Object.assign(obj, { x, y });

    return direction;
  }
}

export default Movement;
