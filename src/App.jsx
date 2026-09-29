import { useEffect, useState } from "react";
import { bfsSolver } from "./utils/bfsSolver";
import "./App.css";

const GOAL_STATE = [1, 2, 3, 4, 5, 6, 7, 8, 0];

const DIFFICULTIES = {
  Easy: {
    moves: 10,
    description: "Simple puzzle",
  },
  Medium: {
    moves: 25,
    description: "Moderate puzzle",
  },
  Hard: {
    moves: 50,
    description: "Challenging puzzle",
  },
};

function App() {
  const [puzzle, setPuzzle] = useState(GOAL_STATE);

  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);

  const [isRunning, setIsRunning] = useState(false);
  const [isSolving, setIsSolving] = useState(false);

  const [difficulty, setDifficulty] = useState("Medium");

  const [solveStep, setSolveStep] = useState(0);
  const [totalSolveSteps, setTotalSolveSteps] = useState(0);

  const [bfsStats, setBfsStats] = useState({
    nodesExplored: 0,
    statesGenerated: 0,
    executionTime: 0,
    solutionDepth: 0,
  });

  const isSolved = puzzle.every(
    (value, index) => value === GOAL_STATE[index]
  );

  useEffect(() => {
    let interval;

    if (isRunning && !isSolved && !isSolving) {
      interval = setInterval(() => {
        setTime((previousTime) => previousTime + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, isSolved, isSolving]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };

  const samePuzzle = (first, second) => {
    return first.every((value, index) => value === second[index]);
  };

  const getValidMoves = (currentPuzzle) => {
    const emptyIndex = currentPuzzle.indexOf(0);

    const row = Math.floor(emptyIndex / 3);
    const col = emptyIndex % 3;

    const validIndexes = [];

    if (row > 0) validIndexes.push(emptyIndex - 3);
    if (row < 2) validIndexes.push(emptyIndex + 3);
    if (col > 0) validIndexes.push(emptyIndex - 1);
    if (col < 2) validIndexes.push(emptyIndex + 1);

    return validIndexes;
  };

  const generatePuzzle = (numberOfMoves) => {
    let newPuzzle = [...GOAL_STATE];
    let previousEmptyIndex = -1;

    for (let i = 0; i < numberOfMoves; i++) {
      const validMoves = getValidMoves(newPuzzle);

      const possibleMoves = validMoves.filter(
        (index) => index !== previousEmptyIndex
      );

      const randomIndex =
        possibleMoves[
          Math.floor(Math.random() * possibleMoves.length)
        ];

      const emptyIndex = newPuzzle.indexOf(0);

      const updatedPuzzle = [...newPuzzle];

      updatedPuzzle[emptyIndex] = updatedPuzzle[randomIndex];
      updatedPuzzle[randomIndex] = 0;

      previousEmptyIndex = emptyIndex;
      newPuzzle = updatedPuzzle;
    }

    if (samePuzzle(newPuzzle, GOAL_STATE)) {
      return generatePuzzle(numberOfMoves);
    }

    return newPuzzle;
  };

  const resetBfsStats = () => {
    setBfsStats({
      nodesExplored: 0,
      statesGenerated: 0,
      executionTime: 0,
      solutionDepth: 0,
    });

    setSolveStep(0);
    setTotalSolveSteps(0);
  };

  const shufflePuzzle = () => {
    if (isSolving) return;

    const newPuzzle = generatePuzzle(
      DIFFICULTIES[difficulty].moves
    );

    setPuzzle(newPuzzle);
    setMoves(0);
    setTime(0);
    setIsRunning(false);

    resetBfsStats();
  };

  const handleDifficultyChange = (newDifficulty) => {
    if (isSolving) return;

    setDifficulty(newDifficulty);

    const newPuzzle = generatePuzzle(
      DIFFICULTIES[newDifficulty].moves
    );

    setPuzzle(newPuzzle);
    setMoves(0);
    setTime(0);
    setIsRunning(false);

    resetBfsStats();
  };

  const moveTile = (index) => {
    if (isSolving) return;

    const emptyIndex = puzzle.indexOf(0);
    const validMoves = getValidMoves(puzzle);

    if (!validMoves.includes(index)) {
      return;
    }

    const newPuzzle = [...puzzle];

    newPuzzle[emptyIndex] = newPuzzle[index];
    newPuzzle[index] = 0;

    setPuzzle(newPuzzle);
    setMoves((previousMoves) => previousMoves + 1);

    if (!isRunning) {
      setIsRunning(true);
    }

    if (
      newPuzzle.every(
        (value, i) => value === GOAL_STATE[i]
      )
    ) {
      setIsRunning(false);
    }
  };

  const resetGame = () => {
    if (isSolving) return;

    setPuzzle(GOAL_STATE);

    setMoves(0);
    setTime(0);
    setIsRunning(false);

    resetBfsStats();
  };

  const solvePuzzle = async () => {
    if (isSolving || isSolved) return;

    setIsSolving(true);
    setIsRunning(false);

    setSolveStep(0);
    setTotalSolveSteps(0);

    const startState = puzzle.join("");

    const result = bfsSolver(startState);

    setBfsStats({
      nodesExplored: result.nodesExplored,
      statesGenerated: result.statesGenerated,
      executionTime: result.executionTime,
      solutionDepth: result.solutionDepth,
    });

    if (result.path.length === 0) {
      setIsSolving(false);
      return;
    }

    const totalSteps = result.path.length - 1;

    setTotalSolveSteps(totalSteps);

    for (let i = 1; i < result.path.length; i++) {
      await new Promise((resolve) =>
        setTimeout(resolve, 400)
      );

      setPuzzle(result.path[i].split("").map(Number));

      setSolveStep(i);
    }

    setIsSolving(false);
  };

  useEffect(() => {
    const initialPuzzle = generatePuzzle(
      DIFFICULTIES.Medium.moves
    );

    setPuzzle(initialPuzzle);
  }, []);

  const progress =
    totalSolveSteps > 0
      ? (solveStep / totalSolveSteps) * 100
      : 0;

  return (
    <div className="app">
      <div className="game-container">

        <header className="header">
          <h1>8-Puzzle BFS</h1>

          <p>
            Solve the classic 8-puzzle using
            Breadth-First Search
          </p>
        </header>

        <section className="difficulty-section">
          <h2>Difficulty</h2>

          <div className="difficulty-buttons">
            {Object.keys(DIFFICULTIES).map((level) => (
              <button
                key={level}
                className={`difficulty-button ${
                  difficulty === level ? "active" : ""
                }`}
                onClick={() =>
                  handleDifficultyChange(level)
                }
                disabled={isSolving}
              >
                {level}
              </button>
            ))}
          </div>

          <p className="difficulty-description">
            {DIFFICULTIES[difficulty].description}
          </p>
        </section>

        <div className="game-stats">
          <div className="game-stat">
            <span>Moves</span>
            <strong>{moves}</strong>
          </div>

          <div className="game-stat">
            <span>Time</span>
            <strong>{formatTime(time)}</strong>
          </div>

          <div className="game-stat">
            <span>Difficulty</span>
            <strong>{difficulty}</strong>
          </div>
        </div>

        <div className="puzzle-board">
          {puzzle.map((value, index) => (
            <button
              key={index}
              className={`tile ${
                value === 0 ? "empty" : ""
              }`}
              onClick={() => moveTile(index)}
              disabled={isSolving || value === 0}
            >
              {value !== 0 ? value : ""}
            </button>
          ))}
        </div>

        {isSolving && (
          <section className="solver-progress">

            <div className="solver-title">
              <span>🧠 BFS Solver Running</span>

              <span>
                Step {solveStep} / {totalSolveSteps}
              </span>
            </div>

            <div className="progress-container">
              <div
                className="progress-bar"
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>

            <div className="solver-details">
              <span>
                Exploring states level by level
              </span>

              <span>
                {Math.round(progress)}%
              </span>
            </div>

          </section>
        )}

        {isSolved && !isSolving && (
          <div className="success-message">
            🎉 Puzzle Solved!
          </div>
        )}

        <div className="controls">

          <button
            className="primary-button"
            onClick={shufflePuzzle}
            disabled={isSolving}
          >
            🔀 Shuffle
          </button>

          <button
            className="secondary-button"
            onClick={resetGame}
            disabled={isSolving}
          >
            🔄 Reset
          </button>

          <button
            className="solve-button"
            onClick={solvePuzzle}
            disabled={isSolving || isSolved}
          >
            🧠 Solve with BFS
          </button>

        </div>

        <section className="bfs-section">
          <h2>BFS Statistics</h2>

          <div className="bfs-stats">

            <div className="stat-card">
              <span>Nodes Explored</span>
              <strong>
                {bfsStats.nodesExplored}
              </strong>
            </div>

            <div className="stat-card">
              <span>States Generated</span>
              <strong>
                {bfsStats.statesGenerated}
              </strong>
            </div>

            <div className="stat-card">
              <span>Solution Depth</span>
              <strong>
                {bfsStats.solutionDepth}
              </strong>
            </div>

            <div className="stat-card">
              <span>BFS Time</span>
              <strong>
                {bfsStats.executionTime.toFixed(2)} ms
              </strong>
            </div>

          </div>
        </section>

        <section className="info-section">

          <h2>How BFS Solves the Puzzle</h2>

          <p>
            Breadth-First Search explores the possible
            puzzle states level by level. The first time
            BFS reaches the goal state, it has found the
            shortest sequence of moves.
          </p>

          <div className="bfs-flow">
            <span>Initial State</span>
            <span>→</span>
            <span>Queue</span>
            <span>→</span>
            <span>Explore</span>
            <span>→</span>
            <span>Generate</span>
            <span>→</span>
            <span>Goal</span>
          </div>

        </section>

      </div>
    </div>
  );
}

export default App;