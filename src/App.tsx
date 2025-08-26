import { useState, useEffect, useRef } from 'react';

import './App.css';
import hashIcon from './assets/hash.svg';
import { getAiMove } from './services/aiService';


type SquareProps = {
  value: string | null;
  isHighlighted?: boolean;
  onSquareClick: () => void;
};

type GameProps = {
  onBack: () => void;
  isAiMode: boolean;
};


function StartScreen({ onStart }: { onStart: (aiMode: boolean) => void }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function logo() {
    return <img src={hashIcon} alt="Hash Icon" className="logo" />;
  }

  return (
    <div className="start-screen">
      {logo()}
      <h1>Jogo da Velha</h1>

      <div
        className="dropdown-container"
        ref={dropdownRef}
        onMouseLeave={() => setShowDropdown(false)}
      >
        <button
          className={`start-button ${showDropdown ? 'active-border' : ''}`}
          onMouseEnter={() => setShowDropdown(true)}
        >
          Iniciar Jogo
        </button>

        <div className={`dropdown ${showDropdown ? 'open' : ''}`}>
          <button onClick={() => onStart(false)} className="mode-button-0">2 Jogadores</button>
          <button onClick={() => onStart(true)} className="mode-button-1">Contra I.A</button>
        </div>
      </div>
    </div>
  );
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
  isAiMode: boolean; // <-- nova prop
};

function Board({ xIsNext, squares, onPlay, isAiMode }: BoardProps) {
  const result = calculateWinner(squares);
  const winner = result?.winner;
  const winningLine = result?.winningLine ?? [];

  function handleClick(i: number) {
    // Bloqueia clique se já houver vencedor, casa ocupada,
    // ou se for a vez da IA no modo contra IA
    if (winner || squares[i] || (isAiMode && !xIsNext)) return;

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
    if (xIsNext) {
      status = 'Próximo jogador: X';
    } else {
      status = isAiMode ? 'Próximo jogador: I.A' : 'Próximo jogador: O';
    }
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
  const [isAiMode, setIsAiMode] = useState(false);

  return (
    <div className="app">
      {!started ? (
        <StartScreen
          onStart={(aiMode: boolean) => {
            setIsAiMode(aiMode);
            setStarted(true);
          }}
        />
      ) : (
        <Game onBack={() => setStarted(false)} isAiMode={isAiMode} />
      )}
    </div>
  );
}

function Game({ onBack, isAiMode }: GameProps) {
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const xIsNext = currentMove % 2 === 0;
  const currentSquare = history[currentMove];

  const result = calculateWinner(currentSquare);
  const winner = result?.winner;
  const isDraw = !currentSquare.includes(null) && !winner;

  useEffect(() => {
  async function makeAiMove() {
    // IA só joga se o modo IA estiver ativo
    if (isAiMode && !xIsNext && !winner && !isDraw) {
      const moveIndex = await getAiMove(currentSquare);
      console.log("IA escolheu:", moveIndex);

      const isValidMove =
        typeof moveIndex === 'number' &&
        moveIndex >= 0 &&
        moveIndex < 9 &&
        !currentSquare[moveIndex];

      if (isValidMove) {
        const nextSquares = currentSquare.slice();
        nextSquares[moveIndex] = 'O';
        handlePlay(nextSquares);
      } else {
        console.warn("Jogada inválida da IA:", moveIndex);
      }
    }
  }

  makeAiMove();
}, [xIsNext, currentSquare, winner, isDraw, isAiMode]);


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
          isAiMode={isAiMode} // <-- passar para o Board
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
