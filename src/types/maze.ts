/**
 * Типы данных для лабиринта
 */

import { Position, Size, Direction } from './common';

/**
 * Клетка лабиринта
 */
export interface Cell {
  position: Position;
  isWall: boolean;
  isVisited: boolean;
  isPath: boolean;
  hasTrail: boolean;
  trailDirection?: Direction;
  waveValue?: number; // Для волнового алгоритма
  parentCell?: Position; // Для алгоритмов генерации
}

/**
 * Лабиринт
 */
export interface Maze {
  size: Size;
  cells: Cell[][];
  startPosition?: Position;
  endPosition?: Position;
  generationType: MazeGenerationType;
  isComplete: boolean;
}

/**
 * Тип генерации лабиринта
 */
export type MazeGenerationType = 'manual' | 'kruskal' | 'prim';

/**
 * Шаг генерации лабиринта
 */
export interface GenerationStep {
  type: 'wall_removed' | 'cell_visited' | 'path_created' | 'component_merged';
  position: Position;
  connectedPosition?: Position;
  maze?: Maze;
  metadata?: Record<string, unknown>;
}

/**
 * Ребро для алгоритма Краскала
 */
export interface Edge {
  from: Position;
  to: Position;
  wall: Position;
  weight: number;
}

/**
 * Создать пустой лабиринт с периметром из стен
 */
export const createEmptyMaze = (size: Size): Maze => {
  const cells: Cell[][] = [];
  
  for (let y = 0; y < size.height; y++) {
    cells[y] = [];
    for (let x = 0; x < size.width; x++) {
      // Периметр всегда стена
      const isPerimeter = x === 0 || x === size.width - 1 || y === 0 || y === size.height - 1;
      
      cells[y][x] = {
        position: { x, y },
        isWall: isPerimeter ? true : true, // Все стены по умолчанию
        isVisited: false,
        isPath: false,
        hasTrail: false,
      };
    }
  }

  return {
    size,
    cells,
    startPosition: { x: 1, y: 1 }, // Временные значения, будут обновлены
    endPosition: { x: size.width - 2, y: size.height - 2 },
    generationType: 'manual',
    isComplete: false,
  };
};

/**
 * Проверить, является ли позиция валидной
 */
export const isValidPosition = (pos: Position, size: Size): boolean => {
  return pos.x >= 0 && pos.x < size.width && pos.y >= 0 && pos.y < size.height;
};

/**
 * Получить клетку по позиции
 */
export const getCell = (maze: Maze, pos: Position): Cell | null => {
  if (!isValidPosition(pos, maze.size)) {
    return null;
  }
  return maze.cells[pos.y][pos.x];
};

/**
 * Установить клетку
 */
export const setCell = (maze: Maze, pos: Position, cell: Partial<Cell>): Maze => {
  if (!isValidPosition(pos, maze.size)) {
    return maze;
  }

  const newCells = maze.cells.map((row, y) =>
    row.map((c, x) => {
      if (x === pos.x && y === pos.y) {
        return { ...c, ...cell };
      }
      return c;
    })
  );

  return {
    ...maze,
    cells: newCells,
  };
};

/**
 * Получить соседей клетки
 */
export const getNeighbors = (maze: Maze, pos: Position): Position[] => {
  const directions: Direction[] = ['up', 'down', 'left', 'right'];
  const neighbors: Position[] = [];

  for (const direction of directions) {
    const neighbor = getNeighborInDirection(pos, direction);
    if (isValidPosition(neighbor, maze.size)) {
      neighbors.push(neighbor);
    }
  }

  return neighbors;
};

/**
 * Получить соседа в определенном направлении
 */
export const getNeighborInDirection = (pos: Position, direction: Direction): Position => {
  switch (direction) {
    case 'up':
      return { x: pos.x, y: pos.y - 1 };
    case 'down':
      return { x: pos.x, y: pos.y + 1 };
    case 'left':
      return { x: pos.x - 1, y: pos.y };
    case 'right':
      return { x: pos.x + 1, y: pos.y };
  }
};

/**
 * Получить стену между двумя клетками
 */
export const getWallBetween = (from: Position, to: Position): Position | null => {
  const dx = to.x - from.x;
  const dy = to.y - from.y;

  // Проверяем, что клетки соседние
  if (Math.abs(dx) + Math.abs(dy) !== 1) {
    return null;
  }

  return {
    x: from.x + dx,
    y: from.y + dy,
  };
};