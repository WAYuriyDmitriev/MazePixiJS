/**
 * Типы данных для состояния игры
 */

import { Size, AnimationState } from './common';
import { Maze, MazeGenerationType } from './maze';
import { Player, TrailSystem } from './player';
import { Theme, ThemeName } from './theme';
import { AlgorithmName } from './algorithm';

/**
 * Экран игры
 */
export type GameScreen = 'menu' | 'generation' | 'playing' | 'solving' | 'completed';

/**
 * Настройки игры
 */
export interface GameSettings {
  mazeSize: Size;
  generationType: MazeGenerationType;
  solvingAlgorithm: AlgorithmName;
  theme: ThemeName;
  showVisualization: boolean;
  animationSpeed: number;
  soundEnabled: boolean;
  showGrid: boolean;
  showCoordinates: boolean;
}

/**
 * Статистика игры
 */
export interface GameStatistics {
  generationTime: number;
  solvingTime: number;
  playerMoves: number;
  optimalPath: number;
  efficiency: number;
  algorithmsUsed: string[];
  startTime: number;
  endTime: number | null;
}

/**
 * Состояние игры
 */
export interface GameState {
  screen: GameScreen;
  maze: Maze | null;
  player: Player | null;
  theme: Theme;
  settings: GameSettings;
  animation: AnimationState;
  trails: TrailSystem;
  statistics: GameStatistics;
  isGenerating: boolean;
  isSolving: boolean;
  isPaused: boolean;
}

/**
 * Настройки по умолчанию
 */
export const DEFAULT_SETTINGS: GameSettings = {
  mazeSize: { width: 15, height: 15 },
  generationType: 'kruskal',
  solvingAlgorithm: 'manual',
  theme: 'spring',
  showVisualization: true,
  animationSpeed: 1,
  soundEnabled: false,
  showGrid: true,
  showCoordinates: false,
};

/**
 * Начальная статистика
 */
export const createInitialStatistics = (): GameStatistics => ({
  generationTime: 0,
  solvingTime: 0,
  playerMoves: 0,
  optimalPath: 0,
  efficiency: 0,
  algorithmsUsed: [],
  startTime: Date.now(),
  endTime: null,
});

/**
 * Начальное состояние анимации
 */
export const createInitialAnimationState = (): AnimationState => ({
  isPlaying: false,
  speed: 1,
  currentStep: 0,
  totalSteps: 0,
});

/**
 * Вычислить эффективность прохождения
 */
export const calculateEfficiency = (
  playerMoves: number,
  optimalPath: number
): number => {
  if (optimalPath === 0 || playerMoves === 0) {
    return 0;
  }
  return Math.round((optimalPath / playerMoves) * 100);
};

/**
 * Форматировать время в читаемый вид
 */
export const formatTime = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes > 0) {
    return `${minutes}м ${remainingSeconds}с`;
  }
  return `${remainingSeconds}с`;
};

/**
 * Получить описание экрана
 */
export const getScreenDescription = (screen: GameScreen): string => {
  switch (screen) {
    case 'menu':
      return 'Главное меню';
    case 'generation':
      return 'Генерация лабиринта';
    case 'playing':
      return 'Прохождение лабиринта';
    case 'solving':
      return 'Автоматическое решение';
    case 'completed':
      return 'Лабиринт пройден';
  }
};