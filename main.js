const canvas=document.getElementById("scene"),
ctx=canvas.getContext("2d");
canvas.width=innerWidth;
canvas.height=innerHeight;

const mapp = document.getElementById("map"),
  mapx = mapp.getContext("2d");
mapp.width=200;
mapp.height=200;

const joy=new Joystick({
  size:150,
  x:innerWidth/8,
  y:innerHeight*0.6
}),
slider=new Slider({
  size:150,
  x:innerWidth*0.8,
  y:innerHeight*0.65
});

const sides={
  top:[130,130,130],
  left:[170,170,170],
  bottom:[130,130,130],
  right:[170,170,170],
  inside:[200,200,200]
};
const sky=ctx.createLinearGradient(0, 0, innerWidth, innerHeight);
sky.addColorStop(0,"#131862");
sky.addColorStop(0.5,"#2e4482");
sky.addColorStop(1,"#546bab");
const grass=ctx.createRadialGradient(innerWidth/2,innerHeight,10,innerWidth/2,innerHeight,1000);
grass.addColorStop(0,"white");
grass.addColorStop(1,"black");

var angled=0,
grid=maze(Array(23).fill(0).map(a=>Array(23).fill(0))),
cellSize=20,
fov=120,
cov=fov,
viewLength=20,
bobY=0,
bobActive=false,
ln=0.5,
renderDis=2,
map=false;
grid.forEach(a=>{
  a.unshift(0);
  a.push(0);
});
const gl=grid[0].length;
grid.push(Array(gl).fill(0));
grid.unshift(Array(gl).fill(0));
grid[grid.length-1][grid[0].length-2]=1;

let point=new Point(cellSize*1.5,cellSize*1.5),
prev=new Point(0,0);
function bob(){
  if(bobActive)return;
  for(let i=0;i<200;i++)
    setTimeout(i>=100?()=>bobY-=0.2:()=>bobY+=0.2,i);
  setTimeout(()=>bobActive=false,500);
  bobActive=true;
}
function detonate(){
  const fx=floor(point.x/cellSize),
        fy=floor(point.y/cellSize);
  for(let i=-1;i<2;i++)for(let j=-1;j<2;j++) grid[fx+i][fy+j]=1;
}
function frame(){
  ctx.clearRect(0,0,innerWidth,innerHeight);
  mapx.clearRect(0,0,200,200);
  mapx.save();
  mapx.translate(100-point.x,100-point.y);
  mapx.fillStyle="black";
  grid.forEach((a,i)=>a.forEach((b,j)=>b===0?mapx.fillRect(i*cellSize,j*cellSize,cellSize,cellSize):0));
  mapx.strokeStyle = "red";
  drawPoint(point);
  let lines=[];
  for(let a=angled-fov/2;a<angled+fov/2;a+=ln){
    let res=castGrid(point,grid,cellSize,a);
    if(res===false){
      lines.push(false)
      continue
    };
    let casted=res[0],
        col=res[1];
    if(casted.x===point.x && casted.y===point.y){
      point.x=prev.x;
      point.y=prev.y;
      res=castGrid(point,grid,cellSize,a);
      casted=res[0];
      col=res[1];
    };
    drawLine(point,casted);
    lines.push([hypot(point.y-casted.y,point.x-casted.x)*cos(PI/180*(angled-a)),col]);
  };
  prev.x = point.x;
  prev.y = point.y;
  mapx.restore();
  let dir=joy.GetDir();
  if(dir!=="C"){
    dir=dir.split("");
    for(let d of dir)CONTROLS[JOYMAP[d]](2);
  };
  let dir2=slider.GetDir();
  if(dir2==="L")CONTROLS.j(2);
  else if (dir2==="R")CONTROLS.l(2);
  for(let i in ACTIVE)if(ACTIVE[i]===true)CONTROLS[i](2);
  drawView(lines.reverse());
  ctx.fillStyle="white";
  ctx.font="20px monospace";
  ctx.fillText(`x: ${floor(point.x/cellSize)}  y: ${floor(point.y/cellSize)}  angle:${angled}`,0,40)
  requestAnimationFrame(frame);
}
function drawPoint(point,fill="green"){
  mapx.fillStyle=fill;
  mapx.beginPath();
  mapx.arc(point.x, point.y, 5, 0, Math.PI * 2);
  mapx.fill();
}
function drawLine(point1,point2){
  mapx.strokeStyle="white";
  mapx.beginPath();
  mapx.moveTo(point1.x,point1.y);
  mapx.lineTo(point2.x,point2.y);
  mapx.stroke();
}
function drawView(lines){
  const MAXW=innerWidth,
        MAXH=innerHeight,
        width=innerWidth,
        length=MAXW/lines.length;
  ctx.fillStyle=sky;
  ctx.fillRect(0,0,MAXW,MAXH);
  ctx.fillStyle = grass;
  ctx.fillRect(0, MAXH/2-bobY, MAXW, MAXH);
  for(let i=0;i<lines.length;i++){
    const ln=lines[i];
    if(ln===false || ln[1]==="none")continue;
    const col=viewLength/ln[0];
    if(col<0) continue;
    const x=i*length,
          y=MAXH*(1-col)/2-bobY,
          w=length+1,
          h=MAXH*col;
    const ld=min(1,col*4);
    ctx.fillStyle=`rgb(${sides[ln[1]].map(a=>a*ld)})`;
    ctx.fillRect(x,y,w,h);
    ctx.fillStyle="black";
    ctx.fillRect(x,y,w,h/20);
    ctx.fillRect(x,y+h-h/20,w,h/20);
   /* ctx.beginPath();
    ctx.moveTo(x1,y1);
    ctx.lineTo(x1,z1);
    ctx.lineTo(x2,z2);
    ctx.lineTo(x2,y2);
    ctx.closePath();
    ctx.fill();*/
  }
}
function rotate(a=2){
  angled=(angled+a+360)%360;
}
const CONTROLS={
  "w":speed=>{
    point.x += Math.cos(angled*Math.PI/180) * speed;
    point.y -= Math.sin(angled*Math.PI/180) * speed;
    bob();
  },
  "a":speed=>{
    point.x -= Math.sin(angled*Math.PI/180) * speed;
    point.y -= Math.cos(angled*Math.PI/180) * speed;
    bob();
  },
  "s":speed=>{
    point.x -= Math.cos(angled*Math.PI/180) * speed;
    point.y += Math.sin(angled*Math.PI/180) * speed;
    bob();
  },
  "d":speed=>{
    point.x += Math.sin(angled*Math.PI/180) * speed;
    point.y += Math.cos(angled*Math.PI/180) * speed;
    bob();
  },
  "j":()=>rotate(5),
  "l":()=>rotate(-5),
  "z":()=>map=!map,
  "c":detonate
},
JOYMAP={
  "N":"w",
  "S":"s",
  "E":"d",
  "W":"a"
},
ACTIVE={
  "w":false,
  "a":false,
  "s":false,
  "d":false,
  "j":false,
  "l":false,
};
addEventListener("keydown",e=>{
  const key=e.key.toLowerCase();
  if(key in ACTIVE)ACTIVE[key]=true;
  else if(key in CONTROLS)CONTROLS[key]();
})
addEventListener("keyup",e=>{
  const key=e.key.toLowerCase();
  if(key in ACTIVE)ACTIVE[key]=false;
})
frame();