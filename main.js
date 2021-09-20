const canvas = document.getElementById("scene"),
  ctx = canvas.getContext("2d");
canvas.width = innerWidth;
canvas.height = innerHeight;

var isMobile = false;
if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) ||
  /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0, 4))) {
  isMobile = true;
}

const map = document.getElementById("map"),
  mapx = map.getContext("2d");
map.width = 200;
map.height = 200;

if (isMobile) {
  var joy = new Joystick({
      size: 150,
      x: innerWidth / 8,
      y: innerHeight * 0.6
    }),
    slider = new Slider({
      size: 150,
      x: innerWidth * 0.8,
      y: innerHeight * 0.65
    });
}

const sides = {
  top: [130, 130, 130],
  left: [170, 170, 170],
  bottom: [130, 130, 130],
  right: [170, 170, 170],
  inside: [200, 200, 200]
};
const sky = ctx.createLinearGradient(0, 0, innerWidth, innerHeight);
sky.addColorStop(0, "#131862");
sky.addColorStop(0.5, "#2e4482");
sky.addColorStop(1, "#546bab");
const grass = ctx.createRadialGradient(innerWidth / 2, innerHeight, 10, innerWidth / 2, innerHeight, 1000);
grass.addColorStop(0, "white");
grass.addColorStop(1, "black");

var angled = 0,
  started=Date.now(),
  grid = maze(Array(103).fill(0).map(a => Array(103).fill(0))),
  cellSize = 20,
  fov = 120,
  cov = fov,
  viewLength = 20,
  bobY = 0,
  bobActive = false,
  ln = 0.5,
  deezlay=started+120000,
  renderDis = 2;
grid.forEach(a => {
  a.unshift(0);
  a.push(0);
});
const gl = grid[0].length;
grid.push(Array(gl).fill(0));
grid.unshift(Array(gl).fill(0));
grid[grid.length - 1][grid[0].length - 2] = 1;

let point = new Point(cellSize * 1.5, cellSize * 1.5),
  prev = new Point(0, 0);

function bob() {
  if (bobActive) return;
  for (let i = 0; i < 200; i++)
    setTimeout(i >= 100 ? () => bobY -= 0.2 : () => bobY += 0.2, i);
  setTimeout(() => bobActive = false, 500);
  bobActive = true;
}

function detonate() {
  const fx = floor(point.x / cellSize),
    fy = floor(point.y / cellSize);
  for (let i = -1; i < 2; i++)
    for (let j = -1; j < 2; j++) grid[fx + i][fy + j] = 1;
}

function frame() {
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  mapx.clearRect(0, 0, 200, 200);
  mapx.save();
  mapx.translate(100 - point.x, 100 - point.y);
  mapx.fillStyle = "black";
  grid.forEach((a, i) => a.forEach((b, j) => b === 0 ? mapx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize) : 0));
  mapx.strokeStyle="yellow";
  if(deezlay < Date.now()){
  mapx.beginPath();
  mapx.moveTo(cellSize*1.5,cellSize*1.5);
  correctPath.forEach(a=>mapx.lineTo(a[0]*cellSize+cellSize/2,a[1]*cellSize+cellSize/2));
  mapx.stroke();}
  mapx.strokeStyle = "red";
  drawPoint(point);
  let lines = [];
  for (let a = angled - fov / 2; a < angled + fov / 2; a += ln) {
    let res = castGrid(point, grid, cellSize, a);
    if (res === false) {
      lines.push(false)
      continue
    };
    let casted = res[0],
      col = res[1];
    if (casted.x === point.x && casted.y === point.y) {
      point.x = prev.x;
      point.y = prev.y;
      res = castGrid(point, grid, cellSize, a);
      casted = res[0];
      col = res[1];
    };
    drawLine(point, casted);
    lines.push([hypot(point.y - casted.y, point.x - casted.x) * cos(PI / 180 * (angled - a)), col]);
  };
  prev.x = point.x;
  prev.y = point.y;
  mapx.restore();
  if (isMobile) {
    let dir = joy.GetDir();
    if (dir !== "C") {
      dir = dir.split("");
      for (let d of dir) CONTROLS[JOYMAP[d]](2);
    };
    let dir2 = slider.GetDir();
    if (dir2 === "L") CONTROLS.j(2);
    else if (dir2 === "R") CONTROLS.l(2);
  }
  for (let i in ACTIVE)
    if (ACTIVE[i] === true) CONTROLS[i](2);
  drawView(lines.reverse());
  ctx.fillStyle = "white";
  ctx.font = "20px monospace";
  ctx.fillText(`x: ${floor(point.x/cellSize)}  y: ${floor(point.y/cellSize)}  angle:${angled} time:${~~((Date.now()-started)/1000)}s`, 0, 40)
  requestAnimationFrame(frame);
}

function drawPoint(point, fill = "green") {
  mapx.fillStyle = fill;
  mapx.beginPath();
  mapx.arc(point.x, point.y, 5, 0, Math.PI * 2);
  mapx.fill();
}

function drawLine(point1, point2) {
  mapx.strokeStyle = "white";
  mapx.beginPath();
  mapx.moveTo(point1.x, point1.y);
  mapx.lineTo(point2.x, point2.y);
  mapx.stroke();
}

function drawView(lines) {
  const MAXW = innerWidth,
    MAXH = innerHeight,
    width = innerWidth,
    length = MAXW / lines.length;
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, MAXW, MAXH);
  ctx.fillStyle = grass;
  ctx.fillRect(0, MAXH / 2 - bobY, MAXW, MAXH);
  for (let i = 0; i < lines.length; i++) {
    const ln = lines[i];
    if (ln === false || ln[1] === "none") continue;
    const col = viewLength / ln[0];
    if (col < 0) continue;
    const x = i * length,
      y = MAXH * (1 - col) / 2 - bobY,
      w = length + 1,
      h = MAXH * col;
    const ld = min(1, col * 4);
    ctx.fillStyle = `rgb(${sides[ln[1]].map(a=>a*ld)})`;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = "black";
    ctx.fillRect(x, y, w, h / 20);
    ctx.fillRect(x, y + h - h / 20, w, h / 20);
    /* ctx.beginPath();
     ctx.moveTo(x1,y1);
     ctx.lineTo(x1,z1);
     ctx.lineTo(x2,z2);
     ctx.lineTo(x2,y2);
     ctx.closePath();
     ctx.fill();*/
  }
}

function rotate(a = 2) {
  angled = (angled + a + 360) % 360;
}
const CONTROLS = {
    "w": speed => {
      point.x += Math.cos(angled * Math.PI / 180) * speed;
      point.y -= Math.sin(angled * Math.PI / 180) * speed;
      bob();
    },
    "a": speed => {
      point.x -= Math.sin(angled * Math.PI / 180) * speed;
      point.y -= Math.cos(angled * Math.PI / 180) * speed;
      bob();
    },
    "s": speed => {
      point.x -= Math.cos(angled * Math.PI / 180) * speed;
      point.y += Math.sin(angled * Math.PI / 180) * speed;
      bob();
    },
    "d": speed => {
      point.x += Math.sin(angled * Math.PI / 180) * speed;
      point.y += Math.cos(angled * Math.PI / 180) * speed;
      bob();
    },
    "j": () => rotate(5),
    "l": () => rotate(-5),
    "c": detonate
  },
  JOYMAP = {
    "N": "w",
    "S": "s",
    "E": "d",
    "W": "a"
  },
  ACTIVE = {
    "w": false,
    "a": false,
    "s": false,
    "d": false,
    "j": false,
    "l": false,
  };
addEventListener("keydown", e => {
  const key = e.key.toLowerCase();
  if (key in ACTIVE) ACTIVE[key] = true;
  else if (key in CONTROLS) CONTROLS[key]();
})
addEventListener("keyup", e => {
  const key = e.key.toLowerCase();
  if (key in ACTIVE) ACTIVE[key] = false;
})
solve(grid,[1,1],[103,103]);
//for(let i=0;i<18;i++)CONTROLS.l();

frame();
//generatePath(correctPath);
//framePath()