import { useEffect, useState } from "react";
import PuzzleBoard from "./components/PuzzleBoard";
import { bfsSolver } from "./utils/bfsSolver";
import "./App.css";

const GOAL = [1, 2, 3, 4, 5, 6, 7, 8, 0];

function isSolved(board) {
  return board.every((value, index) => value === GOAL[index]);
}

function App() {
  const [board, setBoard] = useState(GOAL);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);

  const [running, setRunning] = useState(false);
  const [solving, setSolving] = useState(false);

  const [message, setMessage] = useState(
    "Arrange the tiles!"
  );

  const [bfsStats, setBfsStats] = useState({
    nodesExplored: 0,
    statesGenerated: 0,
    executionTime: 0,
    solutionDepth: 0,
  });

  // -----------------------------------------
  // TIMER
  // -----------------------------------------

  useEffect(() => {
    if (!running || solving) {
      return;
    }

    const timer = setInterval(() => {
      setTime((previousTime) => previousTime + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [running, solving]);

  // -----------------------------------------
  // MOVE TILE
  // -----------------------------------------

  const moveTile = (index) => {
    if (solving) {
      return;
    }

    const emptyIndex = board.indexOf(0);

    const tileRow = Math.floor(index / 3);
    const tileCol = index % 3;

    const emptyRow = Math.floor(emptyIndex / 3);
    const emptyCol = emptyIndex % 3;

    const distance =
      Math.abs(tileRow - emptyRow) +
      Math.abs(tileCol - emptyCol);

    // Tile must be next to empty space
    if (distance !== 1) {
      return;
    }

    const nextBoard = [...board];

    [nextBoard[index], nextBoard[emptyIndex]] = [
      nextBoard[emptyIndex],
      nextBoard[index],
    ];

    setBoard(nextBoard);
    setMoves((previousMoves) => previousMoves + 1);
    setRunning(true);

    if (isSolved(nextBoard)) {
      setMessage("🎉 Puzzle Solved!");
      setRunning(false);
    } else {
      setMessage("Keep going!");
    }
  };

  // -----------------------------------------
  // SHUFFLE
  // -----------------------------------------

  const shuffle = () => {
    if (solving) {
      return;
    }

    let nextBoard = [...GOAL];

    let previousEmpty = -1;

    // Make 100 valid random moves.
    // Because we start from the goal and only make
    // valid moves, the resulting puzzle is solvable.
    for (let i = 0; i < 100; i++) {
      const emptyIndex = nextBoard.indexOf(0);

      const row = Math.floor(emptyIndex / 3);
      const col = emptyIndex % 3;

      const possibleMoves = [];

      if (row > 0) {
        possibleMoves.push(emptyIndex - 3);
      }

      if (row < 2) {
        possibleMoves.push(emptyIndex + 3);
      }

      if (col > 0) {
        possibleMoves.push(emptyIndex - 1);
      }

      if (col < 2) {
        possibleMoves.push(emptyIndex + 1);
      }

      // Avoid immediately reversing the previous move
      const validMoves = possibleMoves.filter(
        (position) => position !== previousEmpty
      );

      const movesToUse =
        validMoves.length > 0
          ? validMoves
          : possibleMoves;

      const randomPosition =
        movesToUse[
          Math.floor(Math.random() * movesToUse.length)
        ];

      previousEmpty = emptyIndex;

      [nextBoard[emptyIndex], nextBoard[randomPosition]] = [
        nextBoard[randomPosition],
        nextBoard[emptyIndex],
      ];
    }

    setBoard(nextBoard);
    setMoves(0);
    setTime(0);
    setRunning(false);
    setSolving(false);

    // Clear previous BFS statistics
    setBfsStats({
      nodesExplored: 0,
      statesGenerated: 0,
      executionTime: 0,
      solutionDepth: 0,
    });

    setMessage("Puzzle shuffled! Start solving.");
  };

  // -----------------------------------------
  // RESET
  // -----------------------------------------

  const reset = () => {
    if (solving) {
      return;
    }

    setBoard(GOAL);
    setMoves(0);
    setTime(0);
    setRunning(false);
    setSolving(false);

    setBfsStats({
      nodesExplored: 0,
      statesGenerated: 0,
      executionTime: 0,
      solutionDepth: 0,
    });

    setMessage("Arrange the tiles!");
  };

  // -----------------------------------------
  // BFS SOLVER
  // -----------------------------------------

  const solvePuzzle = async () => {
    if (solving) {
      return;
    }

    // Already solved
    if (isSolved(board)) {
      setMessage("✅ Puzzle is already solved!");
      return;
    }

    setSolving(true);
    setRunning(false);
    setMessage("🧠 BFS is searching for the shortest path...");

    // Convert:
    // [1,2,3,4,5,6,7,8,0]
    //
    // to:
    // "123456780"

    const initialState = board.join("");

    try {
      // Run your existing BFS solver
      const result = bfsSolver(initialState);

      // Store BFS statistics
      setBfsStats({
        nodesExplored: result.nodesExplored,
        statesGenerated: result.statesGenerated,
        executionTime: result.executionTime,
        solutionDepth: result.solutionDepth,
      });

      // No solution
      if (!result.path || result.path.length === 0) {
        setMessage("❌ No solution found.");
        setSolving(false);
        return;
      }

      setMessage(
        `🧠 BFS found a solution in ${result.solutionDepth} moves!`
      );

      // Animate solution
      for (let i = 1; i < result.path.length; i++) {
        await new Promise((resolve) =>
          setTimeout(resolve, 400)
        );

        const nextState = result.path[i];

        // Convert:
        // "123456780"
        //
        // to:
        // [1,2,3,4,5,6,7,8,0]

        const nextBoard = nextState
          .split("")
          .map(Number);

        setBoard(nextBoard);
      }

      setMoves((previousMoves) => {
        return previousMoves + result.solutionDepth;
      });

      setRunning(false);
      setMessage("🎉 BFS solved the puzzle!");

    } catch (error) {
      console.error("BFS Solver Error:", error);

      setMessage(
        "❌ Error occurred while running BFS."
      );
    } finally {
      setSolving(false);
    }
  };

  // -----------------------------------------
  // TIMER FORMAT
  // -----------------------------------------

  const minutes = String(
    Math.floor(time / 60)
  ).padStart(2, "0");

  const seconds = String(
    time % 60
  ).padStart(2, "0");

  // -----------------------------------------
  // UI
  // -----------------------------------------

  return (
    <div className="app">

      <div className="game-container">

        {/* TITLE */}

        <h1>🧩 8 Puzzle Game</h1>

        <p className="subtitle">
          React + Breadth-First Search (BFS)
        </p>

        {/* GAME STATISTICS */}

        <div className="stats">

          <div className="stat-box">
            <span>Moves</span>

            <strong>
              {moves}
            </strong>
          </div>

          <div className="stat-box">
            <span>Time</span>

            <strong>
              {minutes}:{seconds}
            </strong>
          </div>

        </div>

        {/* PUZZLE */}

        <PuzzleBoard
          board={board}
          onTileClick={moveTile}
          disabled={solving}
        />

        {/* MESSAGE */}

        <p className="message">
          {message}
        </p>

        {/* BUTTONS */}

        <div className="buttons">

          <button
            className="primary-btn"
            onClick={shuffle}
            disabled={solving}
          >
            🔀 Shuffle
          </button>

          <button
            className="secondary-btn"
            onClick={solvePuzzle}
            disabled={solving}
          >
            {solving
              ? "🧠 Solving..."
              : "🧠 Solve with BFS"}
          </button>

          <button
            className="reset-btn"
            onClick={reset}
            disabled={solving}
          >
            🔄 Reset
          </button>

        </div>

        {/* BFS STATISTICS */}

        <div className="bfs-stats">

          <h3>🧠 BFS Statistics</h3>

          <div className="bfs-grid">

            <div className="bfs-stat-box">

              <span>
                Nodes Explored
              </span>

              <strong>
                {bfsStats.nodesExplored}
              </strong>

            </div>

            <div className="bfs-stat-box">

              <span>
                States Generated
              </span>

              <strong>
                {bfsStats.statesGenerated}
              </strong>

            </div>

            <div className="bfs-stat-box">

              <span>
                Solution Depth
              </span>

              <strong>
                {bfsStats.solutionDepth}
              </strong>

            </div>

            <div className="bfs-stat-box">

              <span>
                Execution Time
              </span>

              <strong>
                {bfsStats.executionTime.toFixed(2)} ms
              </strong>

            </div>

          </div>

        </div>

        {/* INSTRUCTIONS */}

        <div className="info">

          <h3>How to Play</h3>

          <p>
            Click a tile next to the empty space.
          </p>

          <p>
            Arrange the numbers from 1 to 8.
          </p>

          <p>
            Use <b>Solve with BFS</b> to automatically
            find the shortest solution.
          </p>

        </div>

      </div>

    </div>
  );
}

export default App;