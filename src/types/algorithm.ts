/**
 * Типы данных для алгоритмов генерации и решения
 */

import { Position, Direction } from './common';
import { Maze, GenerationStep } from './maze';

/**
 * Название алгоритма решения
 */
export type AlgorithmName = 'manual' | 'rightHand' | 'wave';

/**
 * Название алгоритма генерации
 */
export type GenerationAlgorithmName = 'manual' | 'kruskal' | 'prim';

/**
 * Шаг решения лабиринта
 */
export interface SolvingStep {
  type: 'move' | 'backtrack' | 'wave_spread' | 'path_found' | 'dead_end';
  position: Position;
  direction?: Direction;
  waveValue?: number;
  path?: Position[]; // Текущий путь для визуализации
  metadata?: Record<string, unknown>;
}

/**
 * Конфигурация алгоритма решения
 */
export interface AlgorithmConfig {
  name: AlgorithmName;
  displayName: string;
  description: string;
  visualizationEnabled: boolean;
  stepDelay: number;
}

/**
 * Конфигурация алгоритма генерации
 */
export interface GenerationAlgorithmConfig {
  name: GenerationAlgorithmName;
  displayName: string;
  description: string;
  visualizationEnabled: boolean;
  stepDelay: number;
}

/**
 * Интерфейс генератора лабиринтов
 */
export interface MazeGenerator {
  generate(
    width: number,
    height: number,
    onStep?: (step: GenerationStep) => Promise<void>
  ): Promise<Maze>;
}

/**
 * Интерфейс решателя лабиринтов
 */
export interface MazeSolver {
  solve(
    maze: Maze,
    start: Position,
    end: Position,
    onStep?: (step: SolvingStep) => Promise<void>
  ): Promise<Position[]>;
}

/**
 * Конфигурации алгоритмов решения
 */
export const SOLVING_ALGORITHMS: Record<AlgorithmName, AlgorithmConfig> = {
  manual: {
    name: 'manual',
    displayName: 'Ручное управление',
    description: 'Управление игроком с помощью стрелок клавиатуры',
    visualizationEnabled: false,
    stepDelay: 0,
  },
  rightHand: {
    name: 'rightHand',
    displayName: 'Алгоритм правой руки',
    description: 'Следование вдоль правой стены до выхода',
    visualizationEnabled: true,
    stepDelay: 100,
  },
  wave: {
    name: 'wave',
    displayName: 'Волновой алгоритм',
    description: 'Поиск кратчайшего пути методом волны',
    visualizationEnabled: true,
    stepDelay: 50,
  },
};

/**
 * Конфигурации алгоритмов генерации
 */
export const GENERATION_ALGORITHMS: Record<
  GenerationAlgorithmName,
  GenerationAlgorithmConfig
> = {
  manual: {
    name: 'manual',
    displayName: 'Ручное создание',
    description: 'Интерактивное создание лабиринта мышью',
    visualizationEnabled: false,
    stepDelay: 0,
  },
  kruskal: {
    name: 'kruskal',
    displayName: 'Алгоритм Краскала',
    description: 'Генерация через минимальное остовное дерево',
    visualizationEnabled: true,
    stepDelay: 50,
  },
  prim: {
    name: 'prim',
    displayName: 'Алгоритм Прима',
    description: 'Генерация через расширение границ лабиринта',
    visualizationEnabled: true,
    stepDelay: 50,
  },
};

/**
 * Получить конфигурацию алгоритма решения
 */
export const getSolvingAlgorithmConfig = (name: AlgorithmName): AlgorithmConfig => {
  return SOLVING_ALGORITHMS[name];
};

/**
 * Получить конфигурацию алгоритма генерации
 */
export const getGenerationAlgorithmConfig = (
  name: GenerationAlgorithmName
): GenerationAlgorithmConfig => {
  return GENERATION_ALGORITHMS[name];
};

/**
 * Получить все алгоритмы решения
 */
export const getAllSolvingAlgorithms = (): AlgorithmConfig[] => {
  return Object.values(SOLVING_ALGORITHMS);
};

/**
 * Получить все алгоритмы генерации
 */
export const getAllGenerationAlgorithms = (): GenerationAlgorithmConfig[] => {
  return Object.values(GENERATION_ALGORITHMS);
};