function PuzzleBoard({ board, onTileClick, disabled }) {
  return (
    <div className="puzzle-board">
      {board.map((tile, i) => (
        <button
          key={i}
          className={`tile ${tile === 0 ? "empty" : ""}`}
          onClick={() => onTileClick(i)}
          disabled={disabled || tile === 0}
        >
          {tile || ""}
        </button>
      ))}
    </div>
  );
}

export default PuzzleBoard;