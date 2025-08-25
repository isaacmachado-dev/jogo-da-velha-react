import { useState } from 'react';
import './App.css';
import hashIcon from './assets/hash.svg';


type SquareProps = {
  value: string | null;
  isHighlighted?: boolean;
  onSquareClick: () => void;
};

type GameProps = {
  onBack: () => void;
};

function StartScreen({ onStart }: { onStart: () => void }) {

  function logo() {
    return <img src={hashIcon} alt="Hash Icon" className="logo" />;
  }
  return (
    <div className="start-screen">
      {logo()}
      <h1>Jogo da Velha</h1>
      <button onClick={onStart} className="start-button">Iniciar Jogo</button>
    </div>
  )
}

function Square({ value, onSquareClick, isHighlighted }: SquareProps) {
  return (
    <button
      className={`square ${isHighlighted ? 'highlight' : ''}`}
      onClick={onSquareClick}
    >
      {value}
    </button>
  );
}

type BoardProps = {
  xIsNext: boolean;
  squares: (string | null)[];
  onPlay: (nextSquares: (string | null)[]) => void;
};

function Board({ xIsNext, squares, onPlay }: BoardProps) {
  const result = calculateWinner(squares);
  const winner = result?.winner;
  const winningLine = result?.winningLine ?? [];

  function handleClick(i: number) {
    if (winner || squares[i]) return;

    const nextSquares = squares.slice();
    nextSquares[i] = xIsNext ? 'X' : 'O';
    onPlay(nextSquares);
  }

  let status;
  if (winner) {
    status = `${winner} venceu!`;
  } else if (!squares.includes(null)) {
    status = 'Empate!';
  } else {
    status = `Próximo jogador: ${xIsNext ? 'X' : 'O'}`;
  }

  return (
    <>
      <div className="status">{status}</div>

      {[0, 3, 6].map(rowStart => (
        <div className="board-row" key={rowStart}>
          {[0, 1, 2].map(offset => {
            const i = rowStart + offset;
            const isWinningSquare = winningLine.includes(i);
            return (
              <Square
                key={i}
                value={squares[i]}
                onSquareClick={() => handleClick(i)}
                isHighlighted={isWinningSquare}
              />
            );
          })}
        </div>
      ))}
    </>
  );
}

function App() {
  const [started, setStarted] = useState(false);

  return (
    <div className="app">
      {!started ? (
        <StartScreen onStart={() => setStarted(true)} />
      ) : (
        <Game onBack={() => setStarted(false)} />
      )}
    </div>
  );
}

function Game({ onBack }: GameProps) {
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const xIsNext = currentMove % 2 === 0;
  const currentSquare = history[currentMove];

  const result = calculateWinner(currentSquare);
  const winner = result?.winner;
  const isDraw = !currentSquare.includes(null) && !winner;

  function handlePlay(nextSquares: (string | null)[]) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function resetGame() {
    setHistory([Array(9).fill(null)]);
    setCurrentMove(0);
  }

  return (
    <div className="game">
      <div className="game-board">
        <Board
          xIsNext={xIsNext}
          squares={currentSquare}
          onPlay={handlePlay}
        />
      </div>

      {(winner || isDraw) && (
        <div className="reset-container">
          <button onClick={resetGame}>Reiniciar Jogo</button>
        </div>
      )}

      <div className="absolute top-3 left-4">
        <button onClick={onBack}>Voltar</button>
      </div>



    </div>
  );
}

function calculateWinner(squares: (string | null)[]) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (let [a, b, c] of lines) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], winningLine: [a, b, c] };
    }
  }

  return null;
}

export default App;
