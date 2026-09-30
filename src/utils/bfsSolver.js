// src/utils/bfsSolver.js

const GOAL_STATE = "123456780";

/*
  Convert board array to string.

  Example:
  [1, 2, 3, 4, 5, 6, 7, 8, 0]
  becomes:
  "123456780"
*/
export function boardToString(board) {
  return board.join("");
}

/*
  Convert string back to board array.
*/
export function stringToBoard(state) {
  return state.split("").map(Number);
}

/*
  Check whether puzzle is solved.
*/
export function isSolved(board) {
  return boardToString(board) === GOAL_STATE;
}

/*
  Get all valid neighboring states.

  0 represents the empty tile.
*/
function getNeighbors(state) {
  const neighbors = [];

  const zeroIndex = state.indexOf("0");

  const row = Math.floor(zeroIndex / 3);
  const col = zeroIndex % 3;

  const possibleMoves = [];

  if (row > 0) {
    possibleMoves.push(zeroIndex - 3);
  }

  if (row < 2) {
    possibleMoves.push(zeroIndex + 3);
  }

  if (col > 0) {
    possibleMoves.push(zeroIndex - 1);
  }

  if (col < 2) {
    possibleMoves.push(zeroIndex + 1);
  }

  for (const targetIndex of possibleMoves) {
    const stateArray = state.split("");

    stateArray[zeroIndex] = stateArray[targetIndex];
    stateArray[targetIndex] = "0";

    neighbors.push(stateArray.join(""));
  }

  return neighbors;
}

/*
  Detailed BFS solver.

  This function performs normal BFS but also records
  information that can be visualized by the React UI.
*/
export function solveWithBFSDetailed(initialBoard) {
  const startTime = performance.now();

  const initialState = boardToString(initialBoard);

  /*
    If already solved.
  */
  if (initialState === GOAL_STATE) {
    return {
      path: [initialBoard],
      trace: [],
      nodesExplored: 0,
      statesGenerated: 0,
      visitedCount: 1,
      solutionDepth: 0,
      executionTime: performance.now() - startTime,
    };
  }

  /*
    BFS queue.

    Instead of shift(), we use an index because
    shift() is slower for large arrays.
  */
  const queue = [initialState];

  let queueIndex = 0;

  /*
    Visited states.
  */
  const visited = new Set();

  visited.add(initialState);

  /*
    Parent map allows us to reconstruct
    the shortest solution path.
  */
  const parent = new Map();

  parent.set(initialState, null);

  /*
    Depth of each state.
  */
  const depth = new Map();

  depth.set(initialState, 0);

  /*
    Visualization trace.

    We don't store every possible queue state because
    that could make the browser use unnecessary memory.

    Instead, we store a useful snapshot of each
    explored node.
  */
  const trace = [];

  let nodesExplored = 0;
  let statesGenerated = 0;

  let solutionState = null;

  while (queueIndex < queue.length) {
    const currentState = queue[queueIndex];

    queueIndex++;

    nodesExplored++;

    const currentDepth = depth.get(currentState);

    /*
      Generate neighboring states.
    */
    const neighbors = getNeighbors(currentState);

    statesGenerated += neighbors.length;

    const newNeighbors = [];

    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);

        parent.set(neighbor, currentState);

        depth.set(
          neighbor,
          currentDepth + 1
        );

        queue.push(neighbor);

        newNeighbors.push(neighbor);

        /*
          Check goal.
        */
        if (neighbor === GOAL_STATE) {
          solutionState = neighbor;
          break;
        }
      }
    }

    /*
      Save visualization information.

      Queue preview is intentionally limited to
      8 states so the UI remains fast.
    */
    trace.push({
      step: nodesExplored,

      currentState,

      currentDepth,

      queueSize: queue.length - queueIndex,

      visitedCount: visited.size,

      statesGenerated,

      neighbors: neighbors.slice(0, 4),

      newNeighbors: newNeighbors.slice(0, 4),

      queuePreview: queue
        .slice(queueIndex, queueIndex + 8),

      isGoal:
        currentState === GOAL_STATE ||
        solutionState === GOAL_STATE,
    });

    if (solutionState) {
      break;
    }
  }

  /*
    Reconstruct shortest path.
  */
  const path = [];

  if (solutionState) {
    let current = solutionState;

    while (current !== null) {
      path.unshift(
        stringToBoard(current)
      );

      current = parent.get(current);
    }
  }

  const endTime = performance.now();

  return {
    path,

    trace,

    nodesExplored,

    statesGenerated,

    visitedCount: visited.size,

    solutionDepth:
      path.length > 0
        ? path.length - 1
        : 0,

    executionTime:
      endTime - startTime,
  };
}

/*
  Existing/simple BFS API.

  This is intentionally kept so the previous
  project functionality does not break.
*/
export function solveWithBFS(initialBoard) {
  const result =
    solveWithBFSDetailed(initialBoard);

  return result.path;
}