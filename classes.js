const { abs, hypot, max, min, cos, sin, PI, floor } = Math;

function cellDst(px, py, rx, ry, w) {
  const x = rx * w,
    y = ry * w,
    xw = x + w,
    yh = y + h,
    cx = px < xw ? px : xw,
    cy = py < yh ? py : yh;
  return hypot(px - (cx > x ? cx : x), py - (cy > y ? cy : y));
}
class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}
class Rectangle {
  constructor(x, y, w, h, col) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.xw = x + w;
    this.yh = y + h;
    this.col = col;
  }
  signedDst(px, py) {
    const { x, y, xw, yh } = this,
    cx = px < xw ? px : xw,
      cy = py < yh ? py : yh;
    return hypot(px - (cx > x ? cx : x), py - (cy > y ? cy : y));
  }
}
class Circle {
  constructor(x, y, r) {
    this.x = x;
    this.y = y;
    this.r = r;
  }
  signedDst(px, py) {
    return hypot(this.x - px, this.y - py) - this.r;
  }
}

function cast2(point, objects, angle = 0) {
  if (point.x > innerWidth || point.y > innerHeight) return point;
  const cr = min(...objects.map(a => a.signedDst(point)));
  if (cr === 0) return point;
  const dx = cos(angle * PI / 180) * cr,
    dy = -sin(angle * PI / 180) * cr;
  return cast(new Point(point.x + dx, point.y + dy), objects, angle);
}

function checkMax(x, y) {
  return x > innerWidth || y > innerHeight || x < 0 || y < 0;
}

function cast(point, objects, angle = 0) {
  let px = point.x,
    py = point.y,
    cr = [100000, 0],
    crd = 0;
  const cs = cos(angle * PI / 180),
    sc = -sin(angle * PI / 180);
  for (let i = 0; i < 150; i++) {
    if (abs(px - point.x) > innerWidth * 1.5 && abs(px - point.x) > innerHeight * 1.5) break;
    cr = [100000, 0];
    for (let i in objects) {
      crd = objects[i].signedDst(px, py);
      cr = crd < cr[0] ? [crd, i] : cr;
    }
    if (cr[0] < 0.001) break;
    px += cs * cr[0];
    py += sc * cr[0];
  }
  return [new Point(px, py), objects[cr[1]].col];
}

function castGrid(point, grid, cellSize = 100, angle = 0) {
  let px = point.x,
    py = point.y,
    cr = 100000,
    crd = 0;
  const cs = cos(angle * PI / 180),
    sc = -sin(angle * PI / 180);
  for (let i = 0; i < 50; i++) {
    if (abs(px - point.x) > innerWidth * 1.5 && abs(px - point.x) > innerHeight * 1.5) break;
    cr = 100000;
    const fx = floor(px / cellSize),
      fy = floor(py / cellSize),
      objects = [];
    for (let i = -1; i < 2; i++)
      for (let j = -1; j < 2; j++) {
        if ((i === 0 && j === 0)) continue;
        const rx=fx + i,ry=fy + j;
        crd = grid[rx];
        if (crd !== undefined && crd[ry]){
          crd = cellDst(px, py,rx,ry,cellSize);
          cr = crd < cr ? crd : cr;
        }
      }
    if (cr[0] < 0.001) break;
    px += cs * cr;
    py += sc * cr;
  }
}