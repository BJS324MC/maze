let endX,endY,correctPath=[],wasHere,space,width,height;
function solve(grid,start,end){
  space=grid;
  correctPath=[];
  wasHere=grid.map(a=>a.map(b=>0));
  endX=end[0]; 
  endY=end[1];
  width=grid.length;
  height=grid[0].length;
  if(recursiveSolve(start[0],start[1]))return correctPath.reverse();
}
function recursiveSolve(x, y) {
  if (x == endX && y == endY) return true;
  if (!wasHere[x] || wasHere[x][y] === 1) return false;
  wasHere[x][y] = 1;
  if ((x !== 0 && space[x-1] && space[x-1][y] === 1 && recursiveSolve(x - 2, y))
  || (x !== width - 1 && space[x+1] && space[x+1][y] === 1 && recursiveSolve(x + 2, y))
  || (y !== 0 && space[x][y-1] === 1 && recursiveSolve(x, y - 2))
  || (y !== height - 1 && space[x][y+1] === 1 && recursiveSolve(x, y + 2))) {
     correctPath.push([x, y]);
     return true;
   }
  return false;
}