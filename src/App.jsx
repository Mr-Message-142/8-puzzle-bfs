import { useEffect, useRef, useState } from "react";
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
  const [isPaused, setIsPaused] = useState(false);

  const [difficulty, setDifficulty] = useState("Medium");

  const [solveStep, setSolveStep] = useState(0);
  const [totalSolveSteps, setTotalSolveSteps] = useState(0);

  const [solverStatus, setSolverStatus] =
    useState("Ready");

  const [bfsStats, setBfsStats] = useState({
    nodesExplored: 0,
    statesGenerated: 0,
    executionTime: 0,
    solutionDepth: 0,
  });

  const stopRequested = useRef(false);
  const isPausedRef = useRef(false);

  const isSolved = puzzle.every(
    (value, index) => value === GOAL_STATE[index]
  );

  /* ---------------- TIMER ---------------- */

  useEffect(() => {
    let interval;

    if (isRunning && !isSolved && !isSolving) {
      interval = setInterval(() => {
        setTime((previous) => previous + 1);
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

  /* ---------------- PUZZLE HELPERS ---------------- */

  const samePuzzle = (first, second) => {
    return first.every(
      (value, index) => value === second[index]
    );
  };

  const getValidMoves = (currentPuzzle) => {
    const emptyIndex = currentPuzzle.indexOf(0);

    const row = Math.floor(emptyIndex / 3);
    const col = emptyIndex % 3;

    const validIndexes = [];

    if (row > 0) {
      validIndexes.push(emptyIndex - 3);
    }

    if (row < 2) {
      validIndexes.push(emptyIndex + 3);
    }

    if (col > 0) {
      validIndexes.push(emptyIndex - 1);
    }

    if (col < 2) {
      validIndexes.push(emptyIndex + 1);
    }

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
          Math.floor(
            Math.random() * possibleMoves.length
          )
        ];

      const emptyIndex = newPuzzle.indexOf(0);

      const updatedPuzzle = [...newPuzzle];

      updatedPuzzle[emptyIndex] =
        updatedPuzzle[randomIndex];

      updatedPuzzle[randomIndex] = 0;

      previousEmptyIndex = emptyIndex;

      newPuzzle = updatedPuzzle;
    }

    if (samePuzzle(newPuzzle, GOAL_STATE)) {
      return generatePuzzle(numberOfMoves);
    }

    return newPuzzle;
  };

  /* ---------------- RESET STATISTICS ---------------- */

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

  /* ---------------- SHUFFLE ---------------- */

  const shufflePuzzle = () => {
    if (isSolving) return;

    stopRequested.current = true;
    isPausedRef.current = false;

    const newPuzzle = generatePuzzle(
      DIFFICULTIES[difficulty].moves
    );

    setPuzzle(newPuzzle);

    setMoves(0);
    setTime(0);

    setIsRunning(false);
    setIsPaused(false);

    setSolverStatus("Ready");

    resetBfsStats();
  };

  /* ---------------- DIFFICULTY ---------------- */

  const handleDifficultyChange = (newDifficulty) => {
    if (isSolving) return;

    stopRequested.current = true;
    isPausedRef.current = false;

    setDifficulty(newDifficulty);

    const newPuzzle = generatePuzzle(
      DIFFICULTIES[newDifficulty].moves
    );

    setPuzzle(newPuzzle);

    setMoves(0);
    setTime(0);

    setIsRunning(false);
    setIsPaused(false);

    setSolverStatus("Ready");

    resetBfsStats();
  };

  /* ---------------- MANUAL MOVE ---------------- */

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

    setMoves((previous) => previous + 1);

    if (!isRunning) {
      setIsRunning(true);
    }

    if (
      newPuzzle.every(
        (value, i) => value === GOAL_STATE[i]
      )
    ) {
      setIsRunning(false);
      setSolverStatus("Puzzle solved!");
    }
  };

  /* ---------------- RESET GAME ---------------- */

  const resetGame = () => {
    if (isSolving) return;

    stopRequested.current = true;
    isPausedRef.current = false;

    setPuzzle(GOAL_STATE);

    setMoves(0);
    setTime(0);

    setIsRunning(false);
    setIsPaused(false);

    setSolverStatus("Ready");

    resetBfsStats();
  };

  /* ---------------- BFS SOLVER ---------------- */

  const solvePuzzle = async () => {
    if (isSolving || isSolved) return;

    stopRequested.current = false;
    isPausedRef.current = false;

    setIsSolving(true);
    setIsPaused(false);
    setIsRunning(false);

    setSolverStatus("Searching...");

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
      setSolverStatus("No solution found");
      setIsSolving(false);
      return;
    }

    const totalSteps = result.path.length - 1;

    setTotalSolveSteps(totalSteps);

    setSolverStatus("Solution found");

    for (let i = 1; i < result.path.length; i++) {

      if (stopRequested.current) {
        setSolverStatus("Solver stopped");
        setIsSolving(false);
        setIsPaused(false);
        return;
      }

      while (isPausedRef.current) {

        if (stopRequested.current) {
          setSolverStatus("Solver stopped");
          setIsSolving(false);
          return;
        }

        await new Promise((resolve) =>
          setTimeout(resolve, 100)
        );
      }

      await new Promise((resolve) =>
        setTimeout(resolve, 400)
      );

      if (stopRequested.current) {
        setSolverStatus("Solver stopped");
        setIsSolving(false);
        setIsPaused(false);
        return;
      }

      setPuzzle(
        result.path[i].split("").map(Number)
      );

      setSolveStep(i);
    }

    setSolverStatus("Puzzle solved!");

    setIsSolving(false);
    setIsPaused(false);
  };

  /* ---------------- PAUSE ---------------- */

  const pauseSolver = () => {
    if (!isSolving || isPaused) return;

    isPausedRef.current = true;

    setIsPaused(true);

    setSolverStatus("Paused");
  };

  /* ---------------- RESUME ---------------- */

  const resumeSolver = () => {
    if (!isSolving || !isPaused) return;

    isPausedRef.current = false;

    setIsPaused(false);

    setSolverStatus("Solving...");
  };

  /* ---------------- STOP ---------------- */

  const stopSolver = () => {
    if (!isSolving) return;

    stopRequested.current = true;

    isPausedRef.current = false;

    setIsPaused(false);
    setIsSolving(false);

    setSolverStatus("Solver stopped");
  };

  /* ---------------- INITIAL PUZZLE ---------------- */

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

  /* ---------------- UI ---------------- */

  return (
    <div className="app">

      <div className="game-container">

        {/* HEADER */}

        <header className="header">

          <div className="header-badge">
            AI SEARCH ALGORITHM
          </div>

          <h1>8-Puzzle BFS</h1>

          <p>
            Interactive Breadth-First Search
            Puzzle Solver
          </p>

        </header>

        {/* TOP STATUS */}

        <section className="status-banner">

          <div className="status-left">

            <div className="status-icon">
              🧠
            </div>

            <div>
              <span className="status-label">
                SOLVER STATUS
              </span>

              <strong>
                {solverStatus}
              </strong>
            </div>

          </div>

          <div className="status-right">

            <span
              className={`status-dot ${
                isSolving
                  ? "active"
                  : isSolved
                  ? "success"
                  : ""
              }`}
            />

            {isSolving
              ? "AI Running"
              : isSolved
              ? "Completed"
              : "Ready"}

          </div>

        </section>

        {/* DIFFICULTY */}

        <section className="difficulty-section">

          <div className="section-heading">

            <div>
              <span className="section-label">
                GAME MODE
              </span>

              <h2>Select Difficulty</h2>
            </div>

            <span className="difficulty-current">
              {difficulty}
            </span>

          </div>

          <div className="difficulty-buttons">

            {Object.keys(DIFFICULTIES).map(
              (level) => (

                <button
                  key={level}
                  className={`difficulty-button ${
                    difficulty === level
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    handleDifficultyChange(level)
                  }
                  disabled={isSolving}
                >
                  {level}
                </button>

              )
            )}

          </div>

          <p className="difficulty-description">
            {DIFFICULTIES[difficulty].description}
          </p>

        </section>

        {/* GAME DASHBOARD */}

        <section className="dashboard">

          <div className="dashboard-card">

            <div className="dashboard-icon">
              🔢
            </div>

            <div>
              <span>PLAYER MOVES</span>
              <strong>{moves}</strong>
            </div>

          </div>

          <div className="dashboard-card">

            <div className="dashboard-icon">
              ⏱️
            </div>

            <div>
              <span>GAME TIME</span>
              <strong>
                {formatTime(time)}
              </strong>
            </div>

          </div>

          <div className="dashboard-card">

            <div className="dashboard-icon">
              🎯
            </div>

            <div>
              <span>AI DEPTH</span>
              <strong>
                {bfsStats.solutionDepth}
              </strong>
            </div>

          </div>

        </section>

        {/* MAIN GAME */}

        <section className="game-area">

          <div className="game-title">

            <div>
              <span className="section-label">
                PUZZLE BOARD
              </span>

              <h2>
                Arrange numbers 1–8
              </h2>
            </div>

            <div className="goal-state">
              Goal: 1 2 3 / 4 5 6 / 7 8
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
                disabled={
                  isSolving || value === 0
                }
              >
                {value !== 0 ? value : ""}
              </button>

            ))}

          </div>

          {/* SOLVING PROGRESS */}

          {isSolving && (

            <div className="solver-progress">

              <div className="solver-progress-header">

                <div>
                  <span>
                    🧠 BFS SOLVING
                  </span>

                  <strong>
                    Step {solveStep} /{" "}
                    {totalSolveSteps}
                  </strong>
                </div>

                <strong>
                  {Math.round(progress)}%
                </strong>

              </div>

              <div className="progress-container">

                <div
                  className="progress-bar"
                  style={{
                    width: `${progress}%`,
                  }}
                />

              </div>

              <p>
                BFS explores the puzzle state
                space level by level.
              </p>

            </div>

          )}

          {/* SOLVER CONTROLS */}

          {isSolving && (

            <div className="solver-controls">

              {!isPaused ? (

                <button
                  className="pause-button"
                  onClick={pauseSolver}
                >
                  ⏸ Pause
                </button>

              ) : (

                <button
                  className="resume-button"
                  onClick={resumeSolver}
                >
                  ▶ Resume
                </button>

              )}

              <button
                className="stop-button"
                onClick={stopSolver}
              >
                ⏹ Stop
              </button>

            </div>

          )}

          {/* SUCCESS */}

          {isSolved && !isSolving && (

            <div className="success-message">

              <span>🎉</span>

              <div>
                <strong>
                  Puzzle Solved!
                </strong>

                <small>
                  Shortest path found by BFS
                </small>
              </div>

            </div>

          )}

          {/* MAIN BUTTONS */}

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

        </section>

        {/* BFS ANALYTICS */}

        <section className="analytics-section">

          <div className="section-heading">

            <div>
              <span className="section-label">
                PERFORMANCE
              </span>

              <h2>BFS Analytics</h2>
            </div>

            <span className="algorithm-tag">
              BFS
            </span>

          </div>

          <div className="analytics-grid">

            <div className="analytics-card">

              <span>🔍</span>

              <div>
                <small>
                  NODES EXPLORED
                </small>

                <strong>
                  {bfsStats.nodesExplored}
                </strong>
              </div>

            </div>

            <div className="analytics-card">

              <span>🌐</span>

              <div>
                <small>
                  STATES GENERATED
                </small>

                <strong>
                  {bfsStats.statesGenerated}
                </strong>
              </div>

            </div>

            <div className="analytics-card">

              <span>📏</span>

              <div>
                <small>
                  SOLUTION DEPTH
                </small>

                <strong>
                  {bfsStats.solutionDepth}
                </strong>
              </div>

            </div>

            <div className="analytics-card">

              <span>⚡</span>

              <div>
                <small>
                  EXECUTION TIME
                </small>

                <strong>
                  {bfsStats.executionTime.toFixed(2)}
                  <small className="unit">
                    ms
                  </small>
                </strong>
              </div>

            </div>

          </div>

        </section>

        {/* BFS EXPLANATION */}

        <section className="info-section">

          <div className="section-heading">

            <div>
              <span className="section-label">
                ARTIFICIAL INTELLIGENCE
              </span>

              <h2>How BFS Works</h2>
            </div>

          </div>

          <p>
            Breadth-First Search explores all states
            at the current depth before moving to
            deeper states. Since every puzzle move
            has the same cost, the first solution
            found by BFS is guaranteed to contain
            the minimum number of moves.
          </p>

          <div className="bfs-flow">

            <div>
              <span>01</span>
              Initial State
            </div>

            <span>→</span>

            <div>
              <span>02</span>
              Queue
            </div>

            <span>→</span>

            <div>
              <span>03</span>
              Explore
            </div>

            <span>→</span>

            <div>
              <span>04</span>
              Generate
            </div>

            <span>→</span>

            <div>
              <span>05</span>
              Goal
            </div>

          </div>

        </section>

        {/* FOOTER */}

        <footer className="footer">

          <strong>8-Puzzle BFS AI</strong>

          <span>
            React • JavaScript • Breadth-First Search
          </span>

        </footer>

      </div>

    </div>
  );
}

export default App;