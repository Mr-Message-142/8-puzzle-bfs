const GOAL = "123456780";

export const isSolved = (board) =>
  board.join("") === GOAL;

const neighbors = (state) => {
  const result = [];
  const zero = state.indexOf("0");
  const row = Math.floor(zero / 3);
  const col = zero % 3;

  const moves = [];

  if (row > 0) moves.push(zero - 3);
  if (row < 2) moves.push(zero + 3);
  if (col > 0) moves.push(zero - 1);
  if (col < 2) moves.push(zero + 1);

  moves.forEach((pos) => {
    const arr = state.split("");
    [arr[zero], arr[pos]] = [arr[pos], arr[zero]];
    result.push(arr.join(""));
  });

  return result;
};

export const solveWithBFS = (board) => {
  const start = board.join("");

  if (start === GOAL) return [board];

  const queue = [start];
  const visited = new Set([start]);
  const parent = new Map([[start, null]]);

  for (let i = 0; i < queue.length; i++) {
    const current = queue[i];

    for (const next of neighbors(current)) {
      if (visited.has(next)) continue;

      visited.add(next);
      parent.set(next, current);

      if (next === GOAL) {
        const path = [];
        let state = next;

        while (state) {
          path.push(state.split("").map(Number));
          state = parent.get(state);
        }

        return path.reverse();
      }

      queue.push(next);
    }
  }

  return null;
};