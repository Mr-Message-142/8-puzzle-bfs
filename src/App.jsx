import { useEffect, useRef, useState } from "react";
import { bfsSolver } from "./utils/bfsSolver";
import "./App.css";

const GOAL_STATE = [1, 2, 3, 4, 5, 6, 7, 8, 0];

const DIFFICULTIES = {
  Easy: {
    moves: 10,
    description: "Perfect for beginners",
    icon: "🌱",
  },
  Medium: {
    moves: 25,
    description: "Balanced challenge",
    icon: "⚡",
  },
  Hard: {
    moves: 50,
    description: "For puzzle experts",
    icon: "🔥",
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

  const [solverStatus, setSolverStatus] = useState("Ready");
  const [showHelp, setShowHelp] = useState(false);

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

  const moveTile = (index) => {
    if (isSolving) return;

    const emptyIndex = puzzle.indexOf(0);
    const validMoves = getValidMoves(puzzle);

    if (!validMoves.includes(index)) return;

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

  const pauseSolver = () => {
    if (!isSolving || isPaused) return;

    isPausedRef.current = true;
    setIsPaused(true);
    setSolverStatus("Paused");
  };

  const resumeSolver = () => {
    if (!isSolving || !isPaused) return;

    isPausedRef.current = false;
    setIsPaused(false);
    setSolverStatus("Solving...");
  };

  const stopSolver = () => {
    if (!isSolving) return;

    stopRequested.current = true;
    isPausedRef.current = false;

    setIsPaused(false);
    setIsSolving(false);
    setSolverStatus("Solver stopped");
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
      <div className="background-glow glow-one" />
      <div className="background-glow glow-two" />

      <main className="game-container">

        {/* HEADER */}
        <header className="hero">
          <div className="hero-top">
            <div className="ai-badge">
              <span className="pulse-dot" />
              AI SEARCH LAB
            </div>

            <button
              className="help-button"
              onClick={() => setShowHelp(!showHelp)}
            >
              ?
            </button>
          </div>

          <h1>
            8-Puzzle
            <span>BFS Solver</span>
          </h1>

          <p>
            Solve the classic sliding puzzle manually
            or watch Breadth-First Search find the
            shortest solution.
          </p>
        </header>

        {/* HELP */}
        {showHelp && (
          <section className="help-panel">
            <div className="help-icon">💡</div>

            <div>
              <strong>How to play</strong>
              <p>
                Click a tile next to the empty space
                to move it. Arrange the numbers from
                1 to 8 in order.
              </p>
            </div>

            <button
              onClick={() => setShowHelp(false)}
            >
              ×
            </button>
          </section>
        )}

        {/* STATUS */}
        <section className="status-card">
          <div className="status-main">
            <div className="status-orb">
              {isSolving ? "🧠" : isSolved ? "🏆" : "🎮"}
            </div>

            <div>
              <span className="mini-label">
                CURRENT STATUS
              </span>

              <h3>{solverStatus}</h3>
            </div>
          </div>

          <div
            className={`live-status ${
              isSolving
                ? "running"
                : isSolved
                ? "complete"
                : ""
            }`}
          >
            <span />
            {isSolving
              ? "AI ACTIVE"
              : isSolved
              ? "COMPLETED"
              : "READY"}
          </div>
        </section>

        {/* DIFFICULTY */}
        <section className="section-card difficulty-card">
          <div className="section-header">
            <div>
              <span className="mini-label">
                GAME SETTINGS
              </span>

              <h2>Choose your challenge</h2>
            </div>

            <span className="selected-badge">
              {difficulty}
            </span>
          </div>

          <div className="difficulty-grid">
            {Object.entries(DIFFICULTIES).map(
              ([level, data]) => (
                <button
                  key={level}
                  className={`difficulty-option ${
                    difficulty === level
                      ? "selected"
                      : ""
                  }`}
                  onClick={() =>
                    handleDifficultyChange(level)
                  }
                  disabled={isSolving}
                >
                  <span className="difficulty-icon">
                    {data.icon}
                  </span>

                  <span className="difficulty-info">
                    <strong>{level}</strong>
                    <small>{data.description}</small>
                  </span>

                  {difficulty === level && (
                    <span className="check-mark">
                      ✓
                    </span>
                  )}
                </button>
              )
            )}
          </div>
        </section>

        {/* STATS */}
        <section className="top-stats">
          <div className="stat-card">
            <div className="stat-icon blue">↗</div>

            <div>
              <span>YOUR MOVES</span>
              <strong>{moves}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon purple">◷</div>

            <div>
              <span>TIME</span>
              <strong>{formatTime(time)}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">◎</div>

            <div>
              <span>BFS DEPTH</span>
              <strong>
                {bfsStats.solutionDepth || "—"}
              </strong>
            </div>
          </div>
        </section>

        {/* MAIN GAME */}
        <section className="section-card game-card">

          <div className="game-header">
            <div>
              <span className="mini-label">
                PUZZLE BOARD
              </span>

              <h2>Arrange the tiles</h2>
            </div>

            <div className="goal-chip">
              <span>GOAL</span>
              <strong>1 2 3 · 4 5 6 · 7 8</strong>
            </div>
          </div>

          {/* BOARD */}
          <div
            className={`board-wrapper ${
              isSolving ? "ai-solving" : ""
            } ${isSolved ? "solved-board" : ""}`}
          >
            <div className="board-glow" />

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
                  {value !== 0 && (
                    <>
                      <span className="tile-number">
                        {value}
                      </span>
                      <span className="tile-shine" />
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* SOLVING PROGRESS */}
          {isSolving && (
            <div className="progress-card">
              <div className="progress-top">
                <div>
                  <span className="ai-running">
                    🧠 BFS SEARCH RUNNING
                  </span>

                  <strong>
                    Step {solveStep} of{" "}
                    {totalSolveSteps}
                  </strong>
                </div>

                <span className="progress-percent">
                  {Math.round(progress)}%
                </span>
              </div>

              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{
                    width: `${progress}%`,
                  }}
                />
              </div>

              <p>
                Exploring puzzle states level by
                level to find the shortest path.
              </p>
            </div>
          )}

          {/* SOLVER CONTROLS */}
          {isSolving && (
            <div className="solver-controls">
              {!isPaused ? (
                <button
                  className="control pause"
                  onClick={pauseSolver}
                >
                  ⏸ Pause
                </button>
              ) : (
                <button
                  className="control resume"
                  onClick={resumeSolver}
                >
                  ▶ Resume
                </button>
              )}

              <button
                className="control stop"
                onClick={stopSolver}
              >
                ■ Stop
              </button>
            </div>
          )}

          {/* SUCCESS */}
          {isSolved && !isSolving && (
            <div className="success-card">
              <div className="success-icon">
                🏆
              </div>

              <div>
                <strong>Puzzle Solved!</strong>

                <p>
                  You reached the goal state
                  {bfsStats.solutionDepth > 0
                    ? ` in ${bfsStats.solutionDepth} BFS moves.`
                    : "."}
                </p>
              </div>

              <div className="success-check">
                ✓
              </div>
            </div>
          )}

          {/* ACTIONS */}
          <div className="action-buttons">
            <button
              className="action secondary"
              onClick={shufflePuzzle}
              disabled={isSolving}
            >
              <span>🔀</span>
              New Puzzle
            </button>

            <button
              className="action ghost"
              onClick={resetGame}
              disabled={isSolving}
            >
              <span>↻</span>
              Reset
            </button>

            <button
              className="action primary"
              onClick={solvePuzzle}
              disabled={isSolving || isSolved}
            >
              <span>🧠</span>
              Solve with BFS
            </button>
          </div>

          <div className="tip">
            <span>💡</span>
            <p>
              Tip: Try solving it yourself first,
              then use BFS to compare your solution.
            </p>
          </div>
        </section>

        {/* ANALYTICS */}
        <section className="section-card analytics-card-section">

          <div className="section-header">
            <div>
              <span className="mini-label">
                ALGORITHM PERFORMANCE
              </span>

              <h2>BFS Analytics</h2>
            </div>

            <div className="algorithm-pill">
              BFS
            </div>
          </div>

          <div className="analytics-grid">

            <div className="analytics-item">
              <div className="analytics-icon">
                🔍
              </div>

              <div>
                <span>NODES EXPLORED</span>
                <strong>
                  {bfsStats.nodesExplored}
                </strong>
                <small>
                  States examined by BFS
                </small>
              </div>
            </div>

            <div className="analytics-item">
              <div className="analytics-icon">
                🌐
              </div>

              <div>
                <span>STATES GENERATED</span>
                <strong>
                  {bfsStats.statesGenerated}
                </strong>
                <small>
                  Possible states created
                </small>
              </div>
            </div>

            <div className="analytics-item">
              <div className="analytics-icon">
                📏
              </div>

              <div>
                <span>SOLUTION DEPTH</span>
                <strong>
                  {bfsStats.solutionDepth}
                </strong>
                <small>
                  Minimum BFS moves
                </small>
              </div>
            </div>

            <div className="analytics-item">
              <div className="analytics-icon">
                ⚡
              </div>

              <div>
                <span>EXECUTION TIME</span>
                <strong>
                  {bfsStats.executionTime.toFixed(2)}
                  <small className="ms">
                    ms
                  </small>
                </strong>
                <small>
                  Solver computation time
                </small>
              </div>
            </div>

          </div>
        </section>

        {/* HOW BFS WORKS */}
        <section className="section-card education-card">

          <div className="section-header">
            <div>
              <span className="mini-label">
                LEARN THE ALGORITHM
              </span>

              <h2>How does BFS solve it?</h2>
            </div>

            <div className="book-icon">
              🧠
            </div>
          </div>

          <p className="education-text">
            Breadth-First Search explores the puzzle
            state space level by level. Because every
            tile movement has the same cost, the first
            solution BFS finds contains the minimum
            number of moves.
          </p>

          <div className="bfs-steps">

            <div className="bfs-step">
              <span>01</span>
              <strong>Start</strong>
              <small>
                Current puzzle
              </small>
            </div>

            <div className="step-arrow">→</div>

            <div className="bfs-step">
              <span>02</span>
              <strong>Queue</strong>
              <small>
                Add state
              </small>
            </div>

            <div className="step-arrow">→</div>

            <div className="bfs-step">
              <span>03</span>
              <strong>Explore</strong>
              <small>
                Check state
              </small>
            </div>

            <div className="step-arrow">→</div>

            <div className="bfs-step">
              <span>04</span>
              <strong>Generate</strong>
              <small>
                Create moves
              </small>
            </div>

            <div className="step-arrow">→</div>

            <div className="bfs-step goal-step">
              <span>05</span>
              <strong>Goal</strong>
              <small>
                Solution found
              </small>
            </div>

          </div>
        </section>

        {/* FOOTER */}
        <footer className="footer">
          <div>
            <strong>8-Puzzle BFS</strong>
            <span>AI Search Algorithm Demonstration</span>
          </div>

          <div>
            React • JavaScript • BFS
          </div>
        </footer>

      </main>
    </div>
  );
}

export default App;