let slidePath=[];
const angleMap={
  "2,0":0,
  "0,-2":90,
  "-2,0":180,
  "0,2":270
}

function generatePath(arr){
  let angle=0;
  for(let i=0;i<arr.length-1;i++){
    let a=arr[i],
        b=arr[i+1],
        dif=angleMap[a.map((c,i)=>b[i]-c)],
        path=Array(20).fill("w");
    if(angle!==dif){
      path=Array(18).fill((angle+90)%360===dif?"j":"l").concat(path);
      angle=dif;
    }
    slidePath=slidePath.concat(path);
  }
}
function framePath(){
  if(slidePath.length){
    CONTROLS[slidePath.shift()](2);
    requestAnimationFrame(framePath);
  }
}
/*
j = 5
l = -5

TEST CASES

[[1,3],[1,1]]
angle=0

output:  j * 18 w * 10

*/