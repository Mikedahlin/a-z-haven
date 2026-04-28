export const TILE_TYPES = 5;

export type Tile = number;

export type Board = Tile[][];

const SIZE = 6;
const EMPTY = -1;

export const BOARD_SIZE = SIZE;

export function createBoard(): Board {
  const b: Board = [];
  for (let y = 0; y < SIZE; y++) {
    const row: Tile[] = [];
    for (let x = 0; x < SIZE; x++) {
      let t: Tile;
      let guard = 0;
      do {
        t = Math.floor(Math.random() * TILE_TYPES) as Tile;
        guard++;
      } while (guard < 80 && createsMatchOnSpawn(b, x, y, t));
      row.push(t);
    }
    b.push(row);
  }
  return b;
}

function createsMatchOnSpawn(b: Board, x: number, y: number, t: Tile) {
  if (x >= 2 && b[y][x - 1] === t && b[y][x - 2] === t) return true;
  if (y >= 2 && b[y - 1][x] === t && b[y - 2][x] === t) return true;
  return false;
}

export function swap(
  b: Board,
  ax: number,
  ay: number,
  bx: number,
  by: number,
): Board {
  const next = b.map((row) => [...row]);
  const tmp = next[ay][ax];
  next[ay][ax] = next[by][bx];
  next[by][bx] = tmp;
  return next;
}

export function findMatches(b: Board): boolean[][] {
  const marks: boolean[][] = Array.from({ length: SIZE }, () =>
    Array(SIZE).fill(false),
  );

  for (let y = 0; y < SIZE; y++) {
    let runStart = 0;
    for (let x = 1; x <= SIZE; x++) {
      const end = x === SIZE;
      const same =
        !end && b[y][x] !== EMPTY && b[y][x] === b[y][x - 1];
      if (!same || end) {
        const runEnd = end ? SIZE - 1 : x - 1;
        if (runEnd - runStart + 1 >= 3) {
          for (let k = runStart; k <= runEnd; k++) marks[y][k] = true;
        }
        runStart = x;
      }
    }
  }

  for (let x = 0; x < SIZE; x++) {
    let runStart = 0;
    for (let y = 1; y <= SIZE; y++) {
      const end = y === SIZE;
      const same =
        !end && b[y][x] !== EMPTY && b[y][x] === b[y - 1][x];
      if (!same || end) {
        const runEnd = end ? SIZE - 1 : y - 1;
        if (runEnd - runStart + 1 >= 3) {
          for (let k = runStart; k <= runEnd; k++) marks[k][x] = true;
        }
        runStart = y;
      }
    }
  }

  return marks;
}

export function clearMatches(b: Board, marks: boolean[][]): Board {
  const next = b.map((row) => [...row]);
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      if (marks[y][x]) next[y][x] = EMPTY;
    }
  }
  return next;
}

export function applyGravity(b: Board): Board {
  const next = b.map((row) => [...row]);
  for (let x = 0; x < SIZE; x++) {
    let write = SIZE - 1;
    for (let y = SIZE - 1; y >= 0; y--) {
      if (next[y][x] !== EMPTY) {
        next[write][x] = next[y][x];
        if (write !== y) next[y][x] = EMPTY;
        write--;
      }
    }
    for (let y = write; y >= 0; y--) {
      next[y][x] = Math.floor(Math.random() * TILE_TYPES) as Tile;
    }
  }
  return next;
}

export function countMarks(marks: boolean[][]): number {
  let n = 0;
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) if (marks[y][x]) n++;
  }
  return n;
}

export function swapCreatesMatch(b: Board, ax: number, ay: number, bx: number, by: number): boolean {
  const next = swap(b, ax, ay, bx, by);
  const marks = findMatches(next);
  return countMarks(marks) > 0;
}
