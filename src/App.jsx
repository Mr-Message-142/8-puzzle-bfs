// src/App.jsx

import { useEffect, useRef, useState } from "react";

import {
  isSolved,
  solveWithBFSDetailed,
} from "./utils/bfsSolver";

import "./App.css";

const GOAL_STATE = [
  1, 2, 3,
  4, 5, 6,
  7, 8, 0,
];

const DIFFICULTIES = {
  Easy: {
    moves: 8,
    description: "Beginner friendly",
    icon: "🌱",
  },

  Medium: {
    moves: 18,
    description: "Balanced challenge",
    icon: "⚡",
  },

  Hard: {
    moves: 30,
    description: "Advanced challenge",
    icon: "🔥",
  },
};

function App() {
  const [board, setBoard] =
    useState(GOAL_STATE);

  const [difficulty, setDifficulty] =
    useState("Medium");

  const [moves, setMoves] =
    useState(0);

  const [time, setTime] =
    useState(0);

  const [isRunning, setIsRunning] =
    useState(false);

  const [isSolving, setIsSolving] =
    useState(false);

  const [isPaused, setIsPaused] =
    useState(false);

  const [status, setStatus] =
    useState("Ready");

  /*
    BFS statistics
  */
  const [stats, setStats] = useState({
    nodesExplored: 0,
    statesGenerated: 0,
    visitedCount: 0,
    solutionDepth: 0,
    executionTime: 0,
  });

  /*
    BFS visualization
  */
  const [bfsView, setBfsView] =
    useState({
      currentState: null,
      currentDepth: 0,
      queueSize: 0,
      visitedCount: 0,
      statesGenerated: 0,
      neighbors: [],
      newNeighbors: [],
      queuePreview: [],
      step: 0,
    });

  /*
    Complete trace returned by BFS.
  */
  const [bfsTrace, setBfsTrace] =
    useState([]);

  /*
    Current solution step.
  */
  const [solutionStep, setSolutionStep] =
    useState(0);

  const [solutionPath, setSolutionPath] =
    useState([]);

  const [showHelp, setShowHelp] =
    useState(false);

  const stopRequested =
    useRef(false);

  const pauseRequested =
    useRef(false);

  /*
    Timer
  */
  useEffect(() => {
    if (!isRunning || isSolving) {
      return;
    }

    const interval = setInterval(() => {
      setTime(
        (previous) => previous + 1
      );
    }, 1000);

    return () =>
      clearInterval(interval);
  }, [isRunning, isSolving]);

  /*
    Format timer.
  */
  const formatTime = (seconds) => {
    const minutes =
      Math.floor(seconds / 60);

    const remaining =
      seconds % 60;

    return `${String(minutes).padStart(
      2,
      "0"
    )}:${String(remaining).padStart(
      2,
      "0"
    )}`;
  };

  /*
    Get valid tile positions.
  */
  const getValidMoves = (currentBoard) => {
    const emptyIndex =
      currentBoard.indexOf(0);

    const row =
      Math.floor(emptyIndex / 3);

    const col =
      emptyIndex % 3;

    const positions = [];

    if (row > 0) {
      positions.push(emptyIndex - 3);
    }

    if (row < 2) {
      positions.push(emptyIndex + 3);
    }

    if (col > 0) {
      positions.push(emptyIndex - 1);
    }

    if (col < 2) {
      positions.push(emptyIndex + 1);
    }

    return positions;
  };

  /*
    Generate a solvable puzzle by making
    valid random moves from the goal state.
  */
  const generatePuzzle = (numberOfMoves) => {
    let newBoard = [...GOAL_STATE];

    let previousEmptyIndex = -1;

    for (
      let i = 0;
      i < numberOfMoves;
      i++
    ) {
      const validMoves =
        getValidMoves(newBoard);

      const availableMoves =
        validMoves.filter(
          (index) =>
            index !==
            previousEmptyIndex
        );

      const randomIndex =
        availableMoves[
          Math.floor(
            Math.random() *
              availableMoves.length
          )
        ];

      const emptyIndex =
        newBoard.indexOf(0);

      const updatedBoard =
        [...newBoard];

      updatedBoard[emptyIndex] =
        updatedBoard[randomIndex];

      updatedBoard[randomIndex] =
        0;

      previousEmptyIndex =
        emptyIndex;

      newBoard = updatedBoard;
    }

    return newBoard;
  };

  /*
    Reset BFS visualization.
  */
  const resetBFS = () => {
    setStats({
      nodesExplored: 0,
      statesGenerated: 0,
      visitedCount: 0,
      solutionDepth: 0,
      executionTime: 0,
    });

    setBfsTrace([]);

    setBfsView({
      currentState: null,
      currentDepth: 0,
      queueSize: 0,
      visitedCount: 0,
      statesGenerated: 0,
      neighbors: [],
      newNeighbors: [],
      queuePreview: [],
      step: 0,
    });

    setSolutionPath([]);

    setSolutionStep(0);
  };

  /*
    Start a new puzzle.
  */
  const newPuzzle = () => {
    if (isSolving) return;

    stopRequested.current = true;
    pauseRequested.current = false;

    const generated =
      generatePuzzle(
        DIFFICULTIES[difficulty].moves
      );

    setBoard(generated);

    setMoves(0);

    setTime(0);

    setIsRunning(false);

    setIsPaused(false);

    setStatus("Ready");

    resetBFS();
  };

  /*
    Change difficulty.
  */
  const changeDifficulty = (
    newDifficulty
  ) => {
    if (isSolving) return;

    setDifficulty(
      newDifficulty
    );

    stopRequested.current = true;
    pauseRequested.current = false;

    const generated =
      generatePuzzle(
        DIFFICULTIES[
          newDifficulty
        ].moves
      );

    setBoard(generated);

    setMoves(0);

    setTime(0);

    setIsRunning(false);

    setIsPaused(false);

    setStatus("Ready");

    resetBFS();
  };

  /*
    Manual tile movement.
  */
  const moveTile = (index) => {
    if (isSolving) return;

    const emptyIndex =
      board.indexOf(0);

    const validMoves =
      getValidMoves(board);

    if (
      !validMoves.includes(index)
    ) {
      return;
    }

    const updatedBoard =
      [...board];

    updatedBoard[emptyIndex] =
      updatedBoard[index];

    updatedBoard[index] = 0;

    setBoard(updatedBoard);

    setMoves(
      (previous) =>
        previous + 1
    );

    if (!isRunning) {
      setIsRunning(true);
    }

    if (isSolved(updatedBoard)) {
      setIsRunning(false);

      setStatus(
        "Puzzle solved!"
      );
    }
  };

  /*
    Reset to goal board.
  */
  const resetGame = () => {
    if (isSolving) return;

    stopRequested.current = true;
    pauseRequested.current = false;

    setBoard(
      [...GOAL_STATE]
    );

    setMoves(0);

    setTime(0);

    setIsRunning(false);

    setIsPaused(false);

    setStatus("Ready");

    resetBFS();
  };

  /*
    Wait helper.
  */
  const wait = (milliseconds) =>
    new Promise((resolve) =>
      setTimeout(
        resolve,
        milliseconds
      )
    );

  /*
    Animate BFS trace.
  */
  const playBFSVisualization =
    async (trace) => {
      for (
        let i = 0;
        i < trace.length;
        i++
      ) {
        if (
          stopRequested.current
        ) {
          return false;
        }

        while (
          pauseRequested.current
        ) {
          if (
            stopRequested.current
          ) {
            return false;
          }

          await wait(100);
        }

        const snapshot =
          trace[i];

        setBfsView({
          currentState:
            snapshot.currentState,

          currentDepth:
            snapshot.currentDepth,

          queueSize:
            snapshot.queueSize,

          visitedCount:
            snapshot.visitedCount,

          statesGenerated:
            snapshot.statesGenerated,

          neighbors:
            snapshot.neighbors,

          newNeighbors:
            snapshot.newNeighbors,

          queuePreview:
            snapshot.queuePreview,

          step:
            snapshot.step,
        });

        setStatus(
          `BFS exploring level ${snapshot.currentDepth}`
        );

        await wait(55);
      }

      return true;
    };

  /*
    Main BFS solver.
  */
  const solvePuzzle =
    async () => {
      if (
        isSolving ||
        isSolved(board)
      ) {
        return;
      }

      stopRequested.current = false;
      pauseRequested.current = false;

      setIsSolving(true);

      setIsPaused(false);

      setIsRunning(false);

      setStatus(
        "Building BFS search tree..."
      );

      resetBFS();

      /*
        Run BFS.
      */
      const result =
        solveWithBFSDetailed(
          board
        );

      /*
        Save final statistics.
      */
      setStats({
        nodesExplored:
          result.nodesExplored,

        statesGenerated:
          result.statesGenerated,

        visitedCount:
          result.visitedCount,

        solutionDepth:
          result.solutionDepth,

        executionTime:
          result.executionTime,
      });

      setBfsTrace(
        result.trace
      );

      setSolutionPath(
        result.path
      );

      /*
        Replay BFS exploration.
      */
      setStatus(
        "Visualizing BFS search..."
      );

      const completed =
        await playBFSVisualization(
          result.trace
        );

      if (!completed) {
        setIsSolving(false);

        setIsPaused(false);

        setStatus(
          "BFS stopped"
        );

        return;
      }

      /*
        Animate final solution.
      */
      if (
        result.path.length > 0
      ) {
        setStatus(
          "Shortest path found!"
        );

        for (
          let i = 1;
          i < result.path.length;
          i++
        ) {
          if (
            stopRequested.current
          ) {
            setIsSolving(false);

            setStatus(
              "BFS stopped"
            );

            return;
          }

          while (
            pauseRequested.current
          ) {
            if (
              stopRequested.current
            ) {
              setIsSolving(false);

              return;
            }

            await wait(100);
          }

          await wait(350);

          setBoard(
            result.path[i]
          );

          setSolutionStep(i);
        }
      }

      setStatus(
        "Puzzle solved!"
      );

      setIsSolving(false);

      setIsPaused(false);
    };

  /*
    Pause BFS.
  */
  const pauseSolver = () => {
    if (!isSolving) return;

    pauseRequested.current = true;

    setIsPaused(true);

    setStatus(
      "BFS visualization paused"
    );
  };

  /*
    Resume BFS.
  */
  const resumeSolver = () => {
    if (!isSolving) return;

    pauseRequested.current = false;

    setIsPaused(false);

    setStatus(
      "BFS visualization running..."
    );
  };

  /*
    Stop BFS.
  */
  const stopSolver = () => {
    stopRequested.current = true;

    pauseRequested.current = false;

    setIsPaused(false);

    setIsSolving(false);

    setStatus(
      "BFS stopped"
    );
  };

  /*
    Convert BFS state string to board.
  */
  const stateToBoard = (state) => {
    if (!state) {
      return [];
    }

    return state
      .split("")
      .map(Number);
  };

  /*
    Small board component for visualization.
  */
  const MiniBoard = ({
    state,
    highlight = false,
  }) => {
    const values =
      stateToBoard(state);

    return (
      <div
        className={`mini-board ${
          highlight
            ? "mini-highlight"
            : ""
        }`}
      >
        {values.map(
          (value, index) => (
            <div
              key={index}
              className={
                value === 0
                  ? "mini-tile empty"
                  : "mini-tile"
              }
            >
              {value !== 0
                ? value
                : ""}
            </div>
          )
        )}
      </div>
    );
  };

  const progress =
    solutionPath.length > 1
      ? (solutionStep /
          (solutionPath.length - 1)) *
        100
      : 0;

  const solved =
    isSolved(board);

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

              BFS SEARCH LAB
            </div>

            <button
              className="help-button"
              onClick={() =>
                setShowHelp(
                  !showHelp
                )
              }
            >
              ?
            </button>

          </div>

          <h1>
            8-Puzzle
            <span>
              BFS Explorer
            </span>
          </h1>

          <p>
            Explore how Breadth-First
            Search finds the shortest
            solution by searching the
            puzzle state space level
            by level.
          </p>

        </header>

        {/* HELP */}

        {showHelp && (
          <section className="help-panel">

            <div className="help-icon">
              💡
            </div>

            <div>
              <strong>
                How BFS works
              </strong>

              <p>
                BFS places puzzle states
                into a queue and explores
                them level by level until
                the goal state is found.
              </p>
            </div>

            <button
              onClick={() =>
                setShowHelp(false)
              }
            >
              ×
            </button>

          </section>
        )}

        {/* STATUS */}

        <section className="status-card">

          <div className="status-main">

            <div className="status-orb">
              {isSolving
                ? "🧠"
                : solved
                ? "🏆"
                : "🎮"}
            </div>

            <div>

              <span className="mini-label">
                SYSTEM STATUS
              </span>

              <h3>
                {status}
              </h3>

            </div>

          </div>

          <div
            className={`live-status ${
              isSolving
                ? "running"
                : solved
                ? "complete"
                : ""
            }`}
          >
            <span />

            {isSolving
              ? "BFS ACTIVE"
              : solved
              ? "COMPLETED"
              : "READY"}
          </div>

        </section>

        {/* DIFFICULTY */}

        <section className="section-card">

          <div className="section-header">

            <div>

              <span className="mini-label">
                GAME SETTINGS
              </span>

              <h2>
                Choose challenge
              </h2>

            </div>

            <span className="selected-badge">
              {difficulty}
            </span>

          </div>

          <div className="difficulty-grid">

            {Object.entries(
              DIFFICULTIES
            ).map(
              ([
                level,
                data,
              ]) => (
                <button
                  key={level}
                  className={`difficulty-option ${
                    difficulty ===
                    level
                      ? "selected"
                      : ""
                  }`}
                  disabled={
                    isSolving
                  }
                  onClick={() =>
                    changeDifficulty(
                      level
                    )
                  }
                >

                  <span className="difficulty-icon">
                    {data.icon}
                  </span>

                  <span className="difficulty-info">
                    <strong>
                      {level}
                    </strong>

                    <small>
                      {data.description}
                    </small>
                  </span>

                  {difficulty ===
                    level && (
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

            <div className="stat-icon blue">
              ↗
            </div>

            <div>
              <span>
                YOUR MOVES
              </span>

              <strong>
                {moves}
              </strong>
            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon purple">
              ◷
            </div>

            <div>
              <span>
                TIME
              </span>

              <strong>
                {formatTime(
                  time
                )}
              </strong>
            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon green">
              ◎
            </div>

            <div>
              <span>
                BFS DEPTH
              </span>

              <strong>
                {stats.solutionDepth ||
                  "—"}
              </strong>
            </div>

          </div>

        </section>

        {/* PUZZLE */}

        <section className="section-card game-card">

          <div className="game-header">

            <div>

              <span className="mini-label">
                PUZZLE BOARD
              </span>

              <h2>
                Arrange the tiles
              </h2>

            </div>

            <div className="goal-chip">

              <span>
                GOAL
              </span>

              <strong>
                1 2 3 · 4 5 6 · 7 8
              </strong>

            </div>

          </div>

          <div
            className={`board-wrapper ${
              isSolving
                ? "ai-solving"
                : ""
            } ${
              solved
                ? "solved-board"
                : ""
            }`}
          >

            <div className="board-glow" />

            <div className="puzzle-board">

              {board.map(
                (
                  value,
                  index
                ) => (
                  <button
                    key={index}
                    className={`tile ${
                      value === 0
                        ? "empty"
                        : ""
                    }`}
                    disabled={
                      isSolving ||
                      value === 0
                    }
                    onClick={() =>
                      moveTile(
                        index
                      )
                    }
                  >
                    {value !==
                      0 && (
                      <>
                        <span className="tile-number">
                          {value}
                        </span>

                        <span className="tile-shine" />
                      </>
                    )}
                  </button>
                )
              )}

            </div>

          </div>

          {/* SOLUTION PROGRESS */}

          {isSolving &&
            solutionPath.length >
              1 && (
              <div className="progress-card">

                <div className="progress-top">

                  <div>

                    <span className="ai-running">
                      🏆 SOLUTION PATH
                    </span>

                    <strong>
                      Step{" "}
                      {solutionStep}{" "}
                      of{" "}
                      {solutionPath.length -
                        1}
                    </strong>

                  </div>

                  <span className="progress-percent">
                    {Math.round(
                      progress
                    )}
                    %
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

              </div>
            )}

          {/* CONTROLS */}

          {isSolving && (
            <div className="solver-controls">

              {!isPaused ? (
                <button
                  className="control pause"
                  onClick={
                    pauseSolver
                  }
                >
                  ⏸ Pause
                </button>
              ) : (
                <button
                  className="control resume"
                  onClick={
                    resumeSolver
                  }
                >
                  ▶ Resume
                </button>
              )}

              <button
                className="control stop"
                onClick={
                  stopSolver
                }
              >
                ■ Stop
              </button>

            </div>
          )}

          {/* SUCCESS */}

          {solved &&
            !isSolving && (
              <div className="success-card">

                <div className="success-icon">
                  🏆
                </div>

                <div>

                  <strong>
                    Puzzle Solved!
                  </strong>

                  <p>
                    Shortest BFS
                    solution depth:{" "}
                    {
                      stats.solutionDepth
                    }
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
              disabled={
                isSolving
              }
              onClick={
                newPuzzle
              }
            >
              🔀 New Puzzle
            </button>

            <button
              className="action ghost"
              disabled={
                isSolving
              }
              onClick={
                resetGame
              }
            >
              ↻ Reset
            </button>

            <button
              className="action primary"
              disabled={
                isSolving ||
                solved
              }
              onClick={
                solvePuzzle
              }
            >
              🧠 Explore with BFS
            </button>

          </div>

        </section>

        {/* =========================
            LIVE BFS EXPLORER
        ========================= */}

        <section className="section-card bfs-explorer">

          <div className="section-header">

            <div>

              <span className="mini-label">
                LIVE ALGORITHM VISUALIZATION
              </span>

              <h2>
                BFS Explorer
              </h2>

            </div>

            <div className="algorithm-pill">
              QUEUE → EXPLORE → GENERATE
            </div>

          </div>

          {/* LIVE METRICS */}

          <div className="bfs-metrics">

            <div className="bfs-metric">

              <span>
                CURRENT LEVEL
              </span>

              <strong>
                {bfsView.currentDepth}
              </strong>

            </div>

            <div className="bfs-metric">

              <span>
                QUEUE SIZE
              </span>

              <strong>
                {bfsView.queueSize}
              </strong>

            </div>

            <div className="bfs-metric">

              <span>
                VISITED
              </span>

              <strong>
                {bfsView.visitedCount}
              </strong>

            </div>

            <div className="bfs-metric">

              <span>
                GENERATED
              </span>

              <strong>
                {bfsView.statesGenerated}
              </strong>

            </div>

          </div>

          {/* CURRENT STATE */}

          <div className="visual-section">

            <div className="visual-title">

              <span className="number-badge">
                01
              </span>

              <div>
                <strong>
                  Current State
                </strong>

                <small>
                  State currently being
                  explored
                </small>
              </div>

            </div>

            <div className="current-state-area">

              {bfsView.currentState ? (
                <MiniBoard
                  state={
                    bfsView.currentState
                  }
                  highlight
                />
              ) : (
                <div className="empty-visual">
                  Start BFS to see
                  current state
                </div>
              )}

            </div>

          </div>

          {/* GENERATED NEIGHBORS */}

          <div className="visual-section">

            <div className="visual-title">

              <span className="number-badge">
                02
              </span>

              <div>
                <strong>
                  Generated Neighbors
                </strong>

                <small>
                  Possible states created
                  from current state
                </small>
              </div>

            </div>

            <div className="states-row">

              {bfsView.neighbors
                .length > 0 ? (
                bfsView.neighbors.map(
                  (
                    state,
                    index
                  ) => (
                    <div
                      className="state-item"
                      key={`${state}-${index}`}
                    >

                      <MiniBoard
                        state={
                          state
                        }
                      />

                      <span>
                        State{" "}
                        {index + 1}
                      </span>

                    </div>
                  )
                )
              ) : (
                <div className="empty-visual">
                  Neighbor states will
                  appear here
                </div>
              )}

            </div>

          </div>

          {/* QUEUE */}

          <div className="visual-section">

            <div className="visual-title">

              <span className="number-badge">
                03
              </span>

              <div>
                <strong>
                  BFS Queue
                </strong>

                <small>
                  States waiting to be
                  explored
                </small>
              </div>

            </div>

            <div className="queue-container">

              {bfsView.queuePreview
                .length > 0 ? (
                bfsView.queuePreview.map(
                  (
                    state,
                    index
                  ) => (
                    <div
                      className="queue-item"
                      key={`${state}-${index}`}
                    >

                      <span className="queue-number">
                        {index + 1}
                      </span>

                      <MiniBoard
                        state={
                          state
                        }
                      />

                    </div>
                  )
                )
              ) : (
                <div className="empty-visual">
                  Queue is waiting...
                </div>
              )}

            </div>

          </div>

          {/* SEARCH FLOW */}

          <div className="search-flow">

            <div className="flow-step active">

              <span>
                1
              </span>

              <strong>
                Current
              </strong>

            </div>

            <div className="flow-line" />

            <div className="flow-step">

              <span>
                2
              </span>

              <strong>
                Generate
              </strong>

            </div>

            <div className="flow-line" />

            <div className="flow-step">

              <span>
                3
              </span>

              <strong>
                Check Visited
              </strong>

            </div>

            <div className="flow-line" />

            <div className="flow-step">

              <span>
                4
              </span>

              <strong>
                Queue
              </strong>

            </div>

            <div className="flow-line" />

            <div className="flow-step goal">

              <span>
                ✓
              </span>

              <strong>
                Goal
              </strong>

            </div>

          </div>

        </section>

        {/* ANALYTICS */}

        <section className="section-card">

          <div className="section-header">

            <div>

              <span className="mini-label">
                BFS PERFORMANCE
              </span>

              <h2>
                Search Analytics
              </h2>

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

                <span>
                  NODES EXPLORED
                </span>

                <strong>
                  {
                    stats.nodesExplored
                  }
                </strong>

                <small>
                  States examined
                </small>

              </div>

            </div>

            <div className="analytics-item">

              <div className="analytics-icon">
                🌐
              </div>

              <div>

                <span>
                  STATES GENERATED
                </span>

                <strong>
                  {
                    stats.statesGenerated
                  }
                </strong>

                <small>
                  Neighbor states
                </small>

              </div>

            </div>

            <div className="analytics-item">

              <div className="analytics-icon">
                👁️
              </div>

              <div>

                <span>
                  VISITED STATES
                </span>

                <strong>
                  {
                    stats.visitedCount
                  }
                </strong>

                <small>
                  Unique states
                </small>

              </div>

            </div>

            <div className="analytics-item">

              <div className="analytics-icon">
                ⚡
              </div>

              <div>

                <span>
                  SEARCH TIME
                </span>

                <strong>
                  {
                    stats.executionTime.toFixed(
                      2
                    )
                  }
                  <small className="ms">
                    ms
                  </small>
                </strong>

                <small>
                  BFS computation
                </small>

              </div>

            </div>

          </div>

        </section>

        {/* LEARNING */}

        <section className="section-card education-card">

          <div className="section-header">

            <div>

              <span className="mini-label">
                ALGORITHM
              </span>

              <h2>
                Why BFS finds the shortest path
              </h2>

            </div>

            <div className="book-icon">
              🧠
            </div>

          </div>

          <p className="education-text">
            Breadth-First Search explores all
            states at depth 0 before depth 1,
            then depth 2, and so on. Since every
            puzzle movement has the same cost,
            the first time BFS reaches the goal,
            it has found a minimum-move solution.
          </p>

          <div className="bfs-steps">

            <div className="bfs-step">

              <span>
                01
              </span>

              <strong>
                Start
              </strong>

              <small>
                Initial state
              </small>

            </div>

            <div className="step-arrow">
              →
            </div>

            <div className="bfs-step">

              <span>
                02
              </span>

              <strong>
                Queue
              </strong>

              <small>
                Add state
              </small>

            </div>

            <div className="step-arrow">
              →
            </div>

            <div className="bfs-step">

              <span>
                03
              </span>

              <strong>
                Explore
              </strong>

              <small>
                Remove front
              </small>

            </div>

            <div className="step-arrow">
              →
            </div>

            <div className="bfs-step">

              <span>
                04
              </span>

              <strong>
                Generate
              </strong>

              <small>
                Create neighbors
              </small>

            </div>

            <div className="step-arrow">
              →
            </div>

            <div className="bfs-step goal-step">

              <span>
                05
              </span>

              <strong>
                Goal
              </strong>

              <small>
                Solution found
              </small>

            </div>

          </div>

        </section>

        {/* FOOTER */}

        <footer className="footer">

          <div>
            <strong>
              8-Puzzle BFS Explorer
            </strong>

            <span>
              AI Search Algorithm
              Visualization
            </span>
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