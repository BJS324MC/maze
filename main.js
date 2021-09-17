const canvas=document.getElementById("scene"),
ctx=canvas.getContext("2d");
canvas.width=innerWidth;
canvas.height=innerHeight;

var angled=0,
fov=110,
cov=fov,
ln=1,
renderDis=50,
map=false;

let point=new Point(401,260.5),
prev=new Point();
function frame(){
  ctx.clearRect(0,0,innerWidth,innerHeight);
  ctx.strokeStyle = "red";
  drawPoint(point);
  let lines=[];
  for(let a=angled-fov/2;a<angled+fov/2;a+=ln){
    let casted=cast(point,objects,a);
    if(casted.x===point.x && casted.y===point.y){
      point.x=prev.x;
      point.y=prev.y;
      casted=cast(point,objects,a);
    };
    drawLine(point,casted);
    lines.push(hypot(point.y-casted.y,point.x-casted.x)*cos(PI/180*(angled-a)));
  };
  prev.x = point.x;
  prev.y = point.y;
  for(let i in ACTIVE)if(ACTIVE[i]===true)CONTROLS[i](1);
  if(!map)drawView(lines.reverse());
  ctx.fillStyle="black";
  ctx.font="20px monospace";
  ctx.fillText(`x: ${point.x}  y: ${point.y}  angle:${angled}`,0,40)
  requestAnimationFrame(frame);
}
function drawPoint(point,fill="green"){
  ctx.fillStyle=fill;
  ctx.beginPath();
  ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
  ctx.fill();
}
function drawLine(point1,point2){
  ctx.strokeStyle="blue";
  ctx.beginPath();
  ctx.moveTo(point1.x,point1.y);
  ctx.lineTo(point2.x,point2.y);
  ctx.stroke();
}
function drawView(lines){
  const MAXW=innerWidth,
        MAXH=innerHeight,
        width=innerWidth,
        length=MAXW/lines.length;
  ctx.fillStyle="white";
  ctx.fillRect(0,0,MAXW,MAXH);
  ctx.fillStyle = "lightgrey";
  ctx.fillRect(0, MAXH/2, MAXW, MAXH);
  for(let i=0;i<lines.length;i++){
    const ln=lines[i];
    const col=1/ln[0];
    if(col<0) continue;
    const x1=i*length,
          x2=length,
          y1=MAXH*(1-col)/2,
          y2=MAXH*col;
    ctx.globalAlpha=col*renderDis;
    ctx.fillStyle=ln[1];
    ctx.fillRect(x1,y1,x2,y2);
    ctx.globalAlpha=1;
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
  angled+=a;
}
const CONTROLS={
  "w":speed=>{
    point.x += Math.cos(angled*Math.PI/180) * speed;
    point.y -= Math.sin(angled*Math.PI/180) * speed;
  },
  "a":speed=>{
    point.x -= Math.sin(angled*Math.PI/180) * speed;
    point.y -= Math.cos(angled*Math.PI/180) * speed;
  },
  "s":speed=>{
    point.x -= Math.cos(angled*Math.PI/180) * speed;
    point.y += Math.sin(angled*Math.PI/180) * speed;
  },
  "d":speed=>{
    point.x += Math.sin(angled*Math.PI/180) * speed;
    point.y += Math.cos(angled*Math.PI/180) * speed;
  },
  "j":()=>rotate(5),
  "l":()=>rotate(-5),
  "z":()=>map=!map
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