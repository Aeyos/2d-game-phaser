export default class Movement {
  static moveTowards(obj, point, delta) {
    const diffX = point.x - obj.x;
    const diffY = point.y - obj.y;
    let displaceX = 0;
    let displaceY = 0;
    let direction = 'none';

    if (Math.abs(diffX) > 2) {
      displaceX = delta * obj.speed * (diffX > 0 ? 32 : -32);
      if (displaceX > 0) direction = 'right';
      if (displaceX < 0) direction = 'left';
    } else {
      displaceX = diffX;
    }

    if (Math.abs(diffY) > 2) {
      displaceY = delta * obj.speed * (diffY > 0 ? 32 : -32);
      if (displaceY > 0) direction = 'down';
      if (displaceY < 0) direction = 'up';
    } else {
      displaceY = diffY;
    }

    Object.assign(obj, {
      x: obj.x + displaceX,
      y: obj.y + displaceY,
    });

    return direction;
  }
}
