const { abs, hypot, sqrt, max, min, cos, sin, PI, floor } = Math;

function cellDst(px, py, rx, ry, w) {
  const x = rx * w,
    y = ry * w,
    xw = x + w,
    yw = y + w,
    cx = px < xw ? px : xw,
    cy = py < yw ? py : yw;
  return (px - (cx > x ? cx : x)) ** 2 + (py - (cy > y ? cy : y)) ** 2;
}
function cellSide(px, py, rx, ry, w) {
  const x = rx * w,
        y = ry * w;
    cx = px < x + w ? px > x ? "inside" : "right" : "left",
    cy = py < y + w ? py > y ? "inside" : "top" : "bottom";
  return cx==="inside"?cy:cx;
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
    cc = [0,0],
    crd = 0;
  const cs = cos(angle * PI / 180),
    sc = -sin(angle * PI / 180);
  for (let i = 0; i < 50; i++) {
    if (abs(px - point.x) > innerWidth && abs(px - point.x) > innerHeight) return false;
    cr = 100000;
    const fx = floor(px / cellSize),
      fy = floor(py / cellSize);
    cc=[fx,fy];
    if (grid[fx] && grid[fx][fy] === 0) break;
    let getit=true;
    for (let l = 1; l <= 10; l++) {
      let getted=false;
      for (let i = -l; i <= l; i++){
        const rx = fx + i;
        for (let j = -l; j <= l; j++) {
          if (i > -l && j > -l && i < l && j < l)  continue;
          crd = grid[rx];
          if (crd === undefined) continue;
          const ry = fy + j;
          if (crd[ry] === 0) {
            crd = cellDst(px, py, rx, ry, cellSize);
            if(crd < cr){
              cr = crd;
              cc = [rx,ry];
            };
            getted = true;
          }
        }
      }
      if(getted){
        getit=false;
        break;
      };
    }
    if(getit)return false;
    if (cr < 0.1) break;
    cr = sqrt(cr);
    px += cs * cr;
    py += sc * cr;
  }
  return [new Point(px, py),cellSide(px,py,cc[0],cc[1],cellSize)];
}