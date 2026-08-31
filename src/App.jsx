import { useEffect, useState } from "react";
import PuzzleBoard from "./components/PuzzleBoard";
import { solveWithBFS, isSolved } from "./utils/bfsSolver";
import "./App.css";

const GOAL = [1, 2, 3, 4, 5, 6, 7, 8, 0];

function App() {
  const [board, setBoard] = useState(GOAL);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);
  const [solving, setSolving] = useState(false);
  const [message, setMessage] = useState("Arrange the tiles!");

  // Timer
  useEffect(() => {
    if (!running || solving) return;

    const timer = setInterval(() => {
      setTime((t) => t + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [running, solving]);

  // Move tile
  const moveTile = (index) => {
    if (solving) return;

    const empty = board.indexOf(0);

    const row1 = Math.floor(index / 3);
    const col1 = index % 3;

    const row2 = Math.floor(empty / 3);
    const col2 = empty % 3;

    // Check valid move
    if (
      Math.abs(row1 - row2) +
        Math.abs(col1 - col2) !==
      1
    ) {
      return;
    }

    const next = [...board];

    [next[index], next[empty]] = [
      next[empty],
      next[index],
    ];

    setBoard(next);
    setMoves((m) => m + 1);
    setRunning(true);

    if (isSolved(next)) {
      setMessage("🎉 Puzzle Solved!");
      setRunning(false);
    } else {
      setMessage("Keep going!");
    }
  };

  // Shuffle puzzle
  const shuffle = () => {
    let next = [...GOAL];

    for (let i = 0; i < 100; i++) {
      const empty = next.indexOf(0);

      const row = Math.floor(empty / 3);
      const col = empty % 3;

      const possibleMoves = [];

      if (row > 0) {
        possibleMoves.push(empty - 3);
      }

      if (row < 2) {
        possibleMoves.push(empty + 3);
      }

      if (col > 0) {
        possibleMoves.push(empty - 1);
      }

      if (col < 2) {
        possibleMoves.push(empty + 1);
      }

      const position =
        possibleMoves[
          Math.floor(
            Math.random() *
              possibleMoves.length
          )
        ];

      [next[empty], next[position]] = [
        next[position],
        next[empty],
      ];
    }

    setBoard(next);
    setMoves(0);
    setTime(0);
    setRunning(false);
    setSolving(false);
    setMessage("Puzzle shuffled! Start solving.");
  };

  // Reset puzzle
  const reset = () => {
    setBoard(GOAL);
    setMoves(0);
    setTime(0);
    setRunning(false);
    setSolving(false);
    setMessage("Arrange the tiles!");
  };

  // BFS Solver
  const solve = () => {
    if (solving) return;

    if (isSolved(board)) {
      setMessage("Puzzle is already solved!");
      return;
    }

    setSolving(true);
    setRunning(false);
    setMessage("🧠 BFS is finding the shortest solution...");

    setTimeout(() => {
      const solution = solveWithBFS(board);

      if (!solution) {
        setMessage("❌ No solution found!");
        setSolving(false);
        return;
      }

      const solutionMoves = solution.length - 1;

      setMessage(
        `🤖 BFS found a solution in ${solutionMoves} moves!`
      );

      solution.forEach((step, index) => {
        setTimeout(() => {
          setBoard(step);
          setMoves(index);

          // Solution completed
          if (index === solution.length - 1) {
            setMessage(
              `🎉 Solved by BFS in ${solutionMoves} moves!`
            );

            // IMPORTANT:
            // Enable buttons after BFS finishes
            setSolving(false);
          }
        }, index * 300);
      });
    }, 100);
  };

  // Format time
  const minutes = String(
    Math.floor(time / 60)
  ).padStart(2, "0");

  const seconds = String(
    time % 60
  ).padStart(2, "0");

  return (
    <div className="app">
      <div className="game-container">

        <h1>🧩 8 Puzzle Game</h1>

        <p className="subtitle">
          React + Breadth-First Search (BFS)
        </p>

        {/* Statistics */}
        <div className="stats">

          <div className="stat-box">
            <span>Moves</span>
            <strong>{moves}</strong>
          </div>

          <div className="stat-box">
            <span>Time</span>
            <strong>
              {minutes}:{seconds}
            </strong>
          </div>

        </div>

        {/* Puzzle */}
        <PuzzleBoard
          board={board}
          onTileClick={moveTile}
          disabled={solving}
        />

        {/* Message */}
        <p className="message">
          {message}
        </p>

        {/* Buttons */}
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
            onClick={solve}
            disabled={solving}
          >
            🧠 Solve with BFS
          </button>

          <button
            className="reset-btn"
            onClick={reset}
            disabled={solving}
          >
            🔄 Reset
          </button>

        </div>

        {/* Instructions */}
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