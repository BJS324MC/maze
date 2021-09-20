function distance(a, b) {
  return abs(a.r - b.r) + abs(a.c - b.c);
}

class Node {
  constructor(r, c) {
    this.r = r;
    this.c = c;
    this.f = 0;
    this.g = 0;
    this.h = 0;
    this.parent = undefined;
  }
  getNeighbours(grid) {
    let neighbours = [];
    const { r, c } = this,
     checkParent = (a, b) =>!(this.parent && this.parent.r === r + a && this.parent.c === c + b);
    if (grid[r][c - 1] === 1 && checkParent(0, -2))
      neighbours.push(new Node(r, c - 2));
    if (grid[r][c + 1] === 1 && checkParent(0, 2))
      neighbours.push(new Node(r, c + 2));
    if (grid[r - 1] && grid[r - 1][c] === 1 && checkParent(-2, 0))
      neighbours.push(new Node(r - 2, c));
    if (grid[r + 1] && grid[r + 1][c] === 1 && checkParent(1, 0))
      neighbours.push(new Node(r + 2, c));
    return neighbours;
  }
}

async function search(grid, start, end) {
  const openSet = [],
    closedSet = [];
  openSet.push(start);
  while (openSet.length > 0) {
    let qIndex = 0;
    for (let i=0;i<openSet.length;i++)
      if (openSet[i].f < openSet[qIndex].f) qIndex = i;
    let q = openSet[qIndex];
    if (q.r === end.r && q.c === end.c) {
      let tmp = q,
          path = [];
      path.push(q);
      while (tmp.parent) {
        tmp = tmp.parent;
        path.push(tmp);
      };
      return path.reverse();
    }
    closedSet.push(openSet.splice(qIndex, 1));
    let neighbours = q.getNeighbours(grid);
    for (let neighbour of neighbours) {
      if (closedSet.includes(neighbour)) continue;
      let tmpG = q.g + distance(neighbour, q),
        isNew = false;
      if (openSet.includes(neighbour)) {
        if (tmpG < neighbour.g) {
          neighbour.g = tmpG;
          isNew = true;
        }
      } else {
        neighbour.g = tmpG;
        isNew = true;
        openSet.push(neighbour);
      }
      if (isNew) {
        neighbour.h = distance(neighbour, end);
        neighbour.f = neighbour.g + neighbour.h;
        neighbour.parent = q;
      }
    }
  }
  return false;
}