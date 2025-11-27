import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MazeCanvas, ControlPanel } from '../components/game';
import {
  useMazeGenerator,
  useKeyboard,
  usePlayerMovement,
  useMazeSolver,
} from '../hooks';
import {
  GameScreen,
  AlgorithmName,
  ThemeName,
  MazeGenerationType,
  Size,
  Maze,
  getTheme,
} from '../types';
import styles from './GamePage.module.css';

export const GamePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Получаем параметры из state
  const { size, generation, theme: themeName, customMaze } = location.state as {
    size: Size;
    generation: MazeGenerationType;
    theme: ThemeName;
    customMaze?: Maze;
  } || { size: { width: 15, height: 15 }, generation: 'kruskal' as MazeGenerationType, theme: 'spring' as ThemeName };

  // Если нет параметров, редиректим на главную
  useEffect(() => {
    if (!location.state) {
      navigate('/');
    }
  }, [location.state, navigate]);

  // Состояние игры
  const [gameScreen, setGameScreen] = useState<GameScreen>('generation');
  const [isPaused, setIsPaused] = useState(false);
  const [solvingAlgorithm, setSolvingAlgorithm] = useState<AlgorithmName | null>(null);

  // Генерация лабиринта
  const {
    maze,
    generationStep,
    generateMaze,
    setCustomMaze,
    resetMaze,
  } = useMazeGenerator();

  // Движение игрока
  const { player, trails, movePlayer, resetPlayer } = usePlayerMovement(maze);

  // Решение лабиринта
  const { solution, solvingStep, solveMaze, stopSolving } =
    useMazeSolver(maze);

  // Получаем тему
  const theme = getTheme(themeName);

  // Генерируем лабиринт при загрузке или используем customMaze
  useEffect(() => {
    const generate = async () => {
      if (customMaze) {
        // Используем готовый лабиринт из редактора
        setCustomMaze(customMaze);
        setGameScreen('playing');
      } else {
        // Генерируем новый лабиринт
        setGameScreen('generation');
        await generateMaze(generation, size);
        setGameScreen('playing');
      }
    };
    
    if (location.state) {
      generate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Генерируем только один раз при монтировании

  // Обработка клавиатуры
  useKeyboard({
    onArrowKey: (direction) => {
      if (gameScreen === 'playing') {
        movePlayer(direction);
      }
    },
    onPause: () => {
      if (gameScreen === 'playing' || gameScreen === 'solving') {
        setIsPaused((prev) => !prev);
      }
    },
    onReset: () => {
      if (gameScreen === 'playing') {
        resetPlayer();
      }
    },
    enabled: gameScreen === 'playing' || gameScreen === 'solving',
  });

  // Проверка завершения игры
  useEffect(() => {
    if (player?.hasReachedEnd && gameScreen === 'playing') {
      setGameScreen('completed');
    }
  }, [player?.hasReachedEnd, gameScreen]);

  // Обработчики панели управления
  const handlePause = useCallback(() => {
    setIsPaused(true);
  }, []);

  const handleResume = useCallback(() => {
    setIsPaused(false);
  }, []);

  const handleReset = useCallback(() => {
    resetPlayer();
    setSolvingAlgorithm(null);
    setGameScreen('playing');
  }, [resetPlayer]);

  const handleStartSolving = useCallback(
    async (algorithm: AlgorithmName) => {
      if (algorithm === 'manual') return;

      setSolvingAlgorithm(algorithm);
      setGameScreen('solving');

      await solveMaze(algorithm);

      setGameScreen('completed');
    },
    [solveMaze]
  );

  const handleStopSolving = useCallback(() => {
    stopSolving();
    setSolvingAlgorithm(null);
    setGameScreen('playing');
  }, [stopSolving]);

  const handleBackToMenu = useCallback(() => {
    resetMaze();
    resetPlayer();
    setSolvingAlgorithm(null);
    navigate('/');
  }, [resetMaze, resetPlayer, navigate]);

  if (!location.state) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.gameContainer}>
        <div className={styles.canvasWrapper}>
          {maze && (
            <MazeCanvas
              maze={maze}
              player={player}
              trails={trails}
              theme={theme}
              solution={solution}
            />
          )}
        </div>

        <div className={styles.controlsWrapper}>
          <ControlPanel
            gameState={gameScreen}
            isPaused={isPaused}
            solvingAlgorithm={solvingAlgorithm}
            generationStep={generationStep}
            solvingStep={solvingStep}
            movesCount={player?.movementHistory.length || 0}
            onPause={handlePause}
            onResume={handleResume}
            onReset={handleReset}
            onStartSolving={handleStartSolving}
            onStopSolving={handleStopSolving}
            onBackToMenu={handleBackToMenu}
          />
        </div>
      </div>
    </div>
  );
};