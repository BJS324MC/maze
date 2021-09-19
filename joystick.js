class Joystick {
  constructor({ size = 200, x = 0, y = 0 }) {
    const canvas = this.initializeCanvas(x, y, size);
    this.ctx = canvas.getContext('2d');
    this.x = x;
    this.y = y;
    this.dx = x + size / 2;
    this.dy = y + size / 2;
    this.size = size;
    this.touched = false;
    this.addEventListeners(canvas);
    this.draw();
  }
  initializeCanvas(x, y, size) {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    canvas.style.position = "fixed";
    canvas.style.top = y + "px";
    canvas.style.left = x + "px";
    document.body.appendChild(canvas);
    return canvas;
  }
  addEventListeners(canvas) {
    canvas.addEventListener("touchstart", e => this.start(e));
    canvas.addEventListener("touchmove", e => this.move(e));
    canvas.addEventListener("touchend", e => this.end(e));
  }
  start(e) {
    this.dx = e.targetTouches[0].clientX;
    this.dy = e.targetTouches[0].clientY;
    this.draw();
  }
  move(e) {
    this.dx = Math.max(Math.min(e.targetTouches[0].clientX, this.x + this.size * 0.75), this.x + this.size * 0.25);
    this.dy = Math.max(Math.min(e.targetTouches[0].clientY, this.y + this.size * 0.75), this.y + this.size * 0.25);
    this.draw();
  }
  end(e) {
    this.dx = this.x + this.size / 2;
    this.dy = this.y + this.size / 2;
    this.draw();
  }
  GetDir() {
    const s1=this.size / 3,
          s2=s1*2,
          x1=this.dx < this.x + s1,
          y1=this.dy < this.y + s1,
          x2=this.dx < this.x + s2,
          y2=this.dy < this.y + s2;
    return x1 ? y1 ? "NW" : y2 ? "W" : "SW" : x2 ? y1 ? "N" : y2 ? "C" : "S" :y1 ? "NE" : y2 ? "E": "SE";
  }
  draw() {
    const { ctx, x, y, dx, dy, size } = this,
    half = size / 2;
    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = "rgba(205,205,205,0.2)";
    ctx.beginPath();
    ctx.arc(half, half, half, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(165,165,165,0.9)";
    ctx.beginPath();
    ctx.arc(dx - x, dy - y, size / 4, 0, Math.PI * 2);
    ctx.fill();
  }
}