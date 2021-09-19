class Slider {
  constructor({ size = 200, x = 0, y = 0 }) {
    const canvas = this.initializeCanvas(x, y, size);
    this.ctx = canvas.getContext('2d');
    this.x = x;
    this.y = y;
    this.dx = x + size / 2;
    this.size = size;
    this.threshold=this.size/3;
    this.touched = false;
    this.addEventListeners(canvas);
    this.draw();
  }
  initializeCanvas(x, y, size) {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size/2;
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
    e.preventDefault();
    this.dx = e.targetTouches[0].clientX;
    this.draw();
  }
  move(e) {
    e.preventDefault();
    this.dx = Math.max(Math.min(e.targetTouches[0].clientX, this.x + this.size * 0.75), this.x + this.size * 0.25);
    this.draw();
  }
  end(e) {
    e.preventDefault();
    this.dx = this.x + this.size / 2;
    this.draw();
  }
  GetDir() {
    return this.dx < this.x + this.threshold ? "L" : this.dx < this.x + this.threshold * 2 ? "C" : "R"
  }
  draw() {
    const { ctx, x, y, dx, dy, size } = this,
    quarter = size / 4;
    ctx.clearRect(0, 0, size, size/2);
    ctx.fillStyle = "rgba(205,205,205,0.2)";
    ctx.beginPath();
    ctx.arc(quarter, quarter, quarter, 0, Math.PI * 2);
    ctx.arc(quarter*3,quarter,quarter, 0, Math.PI * 2);
    ctx.rect(quarter,0,size/2,size/2);
    ctx.fill();
    ctx.fillStyle = "rgba(165,165,165,0.9)";
    ctx.beginPath();
    ctx.arc(dx - x, quarter, quarter, 0, Math.PI * 2);
    ctx.fill();
  }
}