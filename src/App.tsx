import { useState, useEffect, useRef } from 'react';

import './App.css';
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
  const startButtonRef = useRef<HTMLButtonElement>(null);

  // Foca o botão ao montar — limpa o foco residual do botão "Voltar"
  useEffect(() => {
    startButtonRef.current?.focus();
  }, []);

  useEffect(() => {
    let active = false;
    const timer = setTimeout(() => { active = true; }, 300);

    function handleClickOutside(event: PointerEvent) {
      if (!active) return;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('pointerup', handleClickOutside, { capture: true });
    return () => {
      clearTimeout(timer);
      document.removeEventListener('pointerup', handleClickOutside, { capture: true });
    };
  }, []);


  function logo() {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="96" height="96"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="logo"
      >
        <line x1="4" x2="20" y1="9" y2="9" />
        <line x1="4" x2="20" y1="15" y2="15" />
        <line x1="10" x2="8" y1="3" y2="21" />
        <line x1="16" x2="14" y1="3" y2="21" />
      </svg>
    );
  }

  return (
    <div className="start-screen">
      {logo()}
      <h1>Jogo da Velha</h1>

      <div className="dropdown-container" ref={dropdownRef}>
        {/* Adiciona a ref no botão */}
        <button
          ref={startButtonRef}
          className={`start-button ${showDropdown ? 'active-border' : ''}`}
          onClick={() => setShowDropdown(prev => !prev)}
        >
          Iniciar Jogo
        </button>

        <div className={`dropdown ${showDropdown ? 'open' : ''}`}>
          <button
            onClick={(e) => { e.stopPropagation(); onStart(false); }}
            className="mode-button-0"
          >
            2 Jogadores
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onStart(true); }}
            className="mode-button-1"
          >
            Contra I.A
          </button>
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
