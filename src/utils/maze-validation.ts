/**
 * Утилиты для валидации лабиринта
 */

import { Maze, Position } from '../types';
import { findShortestPath } from './pathfinding';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Проверить, что лабиринт имеет вход и выход
 */
const hasEntranceAndExit = (maze: Maze): { valid: boolean; error?: string } => {
  const hasEntrance = maze.startPosition && 
    !maze.cells[maze.startPosition.y][maze.startPosition.x].isWall;
  const hasExit = maze.endPosition && 
    !maze.cells[maze.endPosition.y][maze.endPosition.x].isWall;

  if (!hasEntrance && !hasExit) {
    return { valid: false, error: 'Лабиринт должен иметь вход и выход' };
  }
  if (!hasEntrance) {
    return { valid: false, error: 'Лабиринт должен иметь вход' };
  }
  if (!hasExit) {
    return { valid: false, error: 'Лабиринт должен иметь выход' };
  }

  return { valid: true };
};

/**
 * Проверить, что путь от входа до выхода существует
 */
const hasPathFromEntranceToExit = (maze: Maze): { valid: boolean; error?: string } => {
  if (!maze.startPosition || !maze.endPosition) {
    return { valid: false, error: 'Не установлены вход или выход' };
  }
  
  const path = findShortestPath(maze, maze.startPosition, maze.endPosition);
  
  if (!path || path.length === 0) {
    return { valid: false, error: 'Нет пути от входа до выхода' };
  }

  return { valid: true };
};

/**
 * Проверить, что нет изолированных областей (островков)
 * Все проходы должны быть достижимы из входа
 */
const hasNoIsolatedAreas = (maze: Maze): { valid: boolean; error?: string } => {
  if (!maze.startPosition) {
    return { valid: false, error: 'Не установлен вход' };
  }
  
  const visited = new Set<string>();
  const queue: Position[] = [maze.startPosition];
  visited.add(`${maze.startPosition.x},${maze.startPosition.y}`);

  // BFS от входа
  while (queue.length > 0) {
    const current = queue.shift()!;
    const directions = [
      { dx: 0, dy: -1 },
      { dx: 0, dy: 1 },
      { dx: -1, dy: 0 },
      { dx: 1, dy: 0 },
    ];

    for (const dir of directions) {
      const next: Position = {
        x: current.x + dir.dx,
        y: current.y + dir.dy,
      };

      if (
        next.x >= 0 &&
        next.x < maze.size.width &&
        next.y >= 0 &&
        next.y < maze.size.height
      ) {
        const key = `${next.x},${next.y}`;
        const cell = maze.cells[next.y][next.x];

        if (!cell.isWall && !visited.has(key)) {
          visited.add(key);
          queue.push(next);
        }
      }
    }
  }

  // Подсчитываем все проходы
  let totalPassages = 0;
  for (let y = 0; y < maze.size.height; y++) {
    for (let x = 0; x < maze.size.width; x++) {
      if (!maze.cells[y][x].isWall) {
        totalPassages++;
      }
    }
  }

  // Если количество посещенных клеток меньше общего количества проходов,
  // значит есть изолированные области
  if (visited.size < totalPassages) {
    return {
      valid: false,
      error: `Обнаружены изолированные области (${totalPassages - visited.size} недостижимых клеток)`,
    };
  }

  return { valid: true };
};

/**
 * Проверить, что вход и выход находятся на периметре
 */
const entranceAndExitOnPerimeter = (maze: Maze): { valid: boolean; error?: string } => {
  const { startPosition, endPosition, size } = maze;

  if (!startPosition || !endPosition) {
    return { valid: false, error: 'Не установлены вход или выход' };
  }

  const isOnPerimeter = (pos: Position) =>
    pos.x === 0 || pos.x === size.width - 1 || pos.y === 0 || pos.y === size.height - 1;

  if (!isOnPerimeter(startPosition)) {
    return { valid: false, error: 'Вход должен находиться на периметре лабиринта' };
  }

  if (!isOnPerimeter(endPosition)) {
    return { valid: false, error: 'Выход должен находиться на периметре лабиринта' };
  }

  return { valid: true };
};

/**
 * Полная валидация лабиринта
 */
export const validateMaze = (maze: Maze): ValidationResult => {
  const errors: string[] = [];

  // 1. Проверка наличия входа и выхода
  const entranceExitCheck = hasEntranceAndExit(maze);
  if (!entranceExitCheck.valid && entranceExitCheck.error) {
    errors.push(entranceExitCheck.error);
    return { isValid: false, errors }; // Дальнейшие проверки бессмысленны
  }

  // 2. Проверка, что вход и выход на периметре
  const perimeterCheck = entranceAndExitOnPerimeter(maze);
  if (!perimeterCheck.valid && perimeterCheck.error) {
    errors.push(perimeterCheck.error);
  }

  // 3. Проверка пути от входа до выхода
  const pathCheck = hasPathFromEntranceToExit(maze);
  if (!pathCheck.valid && pathCheck.error) {
    errors.push(pathCheck.error);
  }

  // 4. Проверка на изолированные области
  const isolatedCheck = hasNoIsolatedAreas(maze);
  if (!isolatedCheck.valid && isolatedCheck.error) {
    errors.push(isolatedCheck.error);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};