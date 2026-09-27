const GOAL_STATE = "123456780";

function getNeighbors(state) {
  const neighbors = [];

  const zeroIndex = state.indexOf("0");
  const row = Math.floor(zeroIndex / 3);
  const col = zeroIndex % 3;

  const moves = [
    { row: -1, col: 0 },
    { row: 1, col: 0 },
    { row: 0, col: -1 },
    { row: 0, col: 1 },
  ];

  for (const move of moves) {
    const newRow = row + move.row;
    const newCol = col + move.col;

    if (
      newRow >= 0 &&
      newRow < 3 &&
      newCol >= 0 &&
      newCol < 3
    ) {
      const newIndex = newRow * 3 + newCol;

      const newState = state.split("");

      newState[zeroIndex] = newState[newIndex];
      newState[newIndex] = "0";

      neighbors.push(newState.join(""));
    }
  }

  return neighbors;
}

export function bfsSolver(initialState) {
  const startTime = performance.now();

  if (initialState === GOAL_STATE) {
    return {
      path: [initialState],
      nodesExplored: 1,
      statesGenerated: 1,
      executionTime: performance.now() - startTime,
      solutionDepth: 0,
    };
  }

  const queue = [initialState];
  let queueIndex = 0;

  const visited = new Set();
  const parent = new Map();

  visited.add(initialState);

  let nodesExplored = 0;
  let statesGenerated = 0;

  while (queueIndex < queue.length) {
    const currentState = queue[queueIndex];
    queueIndex++;

    nodesExplored++;

    if (currentState === GOAL_STATE) {
      const path = [];

      let current = currentState;

      while (current !== undefined) {
        path.push(current);
        current = parent.get(current);
      }

      path.reverse();

      return {
        path,
        nodesExplored,
        statesGenerated,
        executionTime: performance.now() - startTime,
        solutionDepth: path.length - 1,
      };
    }

    const neighbors = getNeighbors(currentState);

    statesGenerated += neighbors.length;

    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        parent.set(neighbor, currentState);
        queue.push(neighbor);
      }
    }
  }

  return {
    path: [],
    nodesExplored,
    statesGenerated,
    executionTime: performance.now() - startTime,
    solutionDepth: 0,
  };
}