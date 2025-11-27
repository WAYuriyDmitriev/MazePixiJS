/**
 * Утилиты для поиска пути в лабиринте
 */

import { Position, Maze, Direction, positionEquals } from '../types';
import { getWalkableNeighbors } from './maze-utils';

/**
 * Найти кратчайший путь с помощью BFS
 */
export const findShortestPath = (
  maze: Maze,
  start: Position,
  end: Position
): Position[] | null => {
  const visited = new Set<string>();
  const queue: { position: Position; path: Position[] }[] = [
    { position: start, path: [start] },
  ];
  visited.add(`${start.x},${start.y}`);

  while (queue.length > 0) {
    const { position, path } = queue.shift()!;

    if (positionEquals(position, end)) {
      return path;
    }

    const neighbors = getWalkableNeighbors(maze, position);
    for (const neighbor of neighbors) {
      const key = `${neighbor.x},${neighbor.y}`;

      if (!visited.has(key)) {
        visited.add(key);
        queue.push({
          position: neighbor,
          path: [...path, neighbor],
        });
      }
    }
  }

  return null;
};

/**
 * Реконструировать путь из карты родителей
 */
export const reconstructPath = (
  parents: Map<string, Position>,
  start: Position,
  end: Position
): Position[] => {
  const path: Position[] = [];
  let current = end;

  while (!positionEquals(current, start)) {
    path.unshift(current);
    const key = `${current.x},${current.y}`;
    const parent = parents.get(key);

    if (!parent) {
      return [];
    }

    current = parent;
  }

  path.unshift(start);
  return path;
};

/**
 * Получить направление от одной позиции к другой
 */
export const getDirectionBetween = (
  from: Position,
  to: Position
): Direction | null => {
  const dx = to.x - from.x;
  const dy = to.y - from.y;

  if (dx === 1 && dy === 0) return 'right';
  if (dx === -1 && dy === 0) return 'left';
  if (dx === 0 && dy === 1) return 'down';
  if (dx === 0 && dy === -1) return 'up';

  return null;
};

/**
 * Проверить, являются ли две позиции соседними
 */
export const areNeighbors = (a: Position, b: Position): boolean => {
  const dx = Math.abs(a.x - b.x);
  const dy = Math.abs(a.y - b.y);
  return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
};

/**
 * Получить все позиции на пути между двумя точками
 */
export const getPositionsBetween = (from: Position, to: Position): Position[] => {
  const positions: Position[] = [];
  const dx = Math.sign(to.x - from.x);
  const dy = Math.sign(to.y - from.y);

  let current = { ...from };

  while (!positionEquals(current, to)) {
    positions.push({ ...current });

    if (current.x !== to.x) {
      current.x += dx;
    } else if (current.y !== to.y) {
      current.y += dy;
    }
  }

  positions.push({ ...to });
  return positions;
};

/**
 * Проверить, пересекается ли путь сам с собой
 */
export const hasPathSelfIntersection = (path: Position[]): boolean => {
  const visited = new Set<string>();

  for (const pos of path) {
    const key = `${pos.x},${pos.y}`;
    if (visited.has(key)) {
      return true;
    }
    visited.add(key);
  }

  return false;
};

/**
 * Упростить путь, удалив лишние точки
 */
export const simplifyPath = (path: Position[]): Position[] => {
  if (path.length <= 2) {
    return path;
  }

  const simplified: Position[] = [path[0]];

  for (let i = 1; i < path.length - 1; i++) {
    const prev = path[i - 1];
    const current = path[i];
    const next = path[i + 1];

    // Проверяем, меняется ли направление
    const dir1 = getDirectionBetween(prev, current);
    const dir2 = getDirectionBetween(current, next);

    if (dir1 !== dir2) {
      simplified.push(current);
    }
  }

  simplified.push(path[path.length - 1]);
  return simplified;
};

/**
 * Получить длину пути
 */
export const getPathLength = (path: Position[]): number => {
  return path.length - 1; // Количество шагов
};

/**
 * Вычислить эффективность пути (отношение оптимального к фактическому)
 */
export const calculatePathEfficiency = (
  actualPath: Position[],
  optimalPath: Position[]
): number => {
  if (actualPath.length === 0 || optimalPath.length === 0) {
    return 0;
  }

  const actualLength = getPathLength(actualPath);
  const optimalLength = getPathLength(optimalPath);

  return Math.round((optimalLength / actualLength) * 100);
};

/**
 * Проверить, содержит ли путь позицию
 */
export const pathContainsPosition = (path: Position[], position: Position): boolean => {
  return path.some((p) => positionEquals(p, position));
};

/**
 * Получить индекс позиции в пути
 */
export const getPositionIndexInPath = (
  path: Position[],
  position: Position
): number => {
  return path.findIndex((p) => positionEquals(p, position));
};

/**
 * Получить подпуть от начала до указанной позиции
 */
export const getSubPath = (path: Position[], toPosition: Position): Position[] => {
  const index = getPositionIndexInPath(path, toPosition);
  if (index === -1) {
    return [];
  }
  return path.slice(0, index + 1);
};

/**
 * Объединить два пути
 */
export const mergePaths = (path1: Position[], path2: Position[]): Position[] => {
  if (path1.length === 0) return path2;
  if (path2.length === 0) return path1;

  // Проверяем, соединяются ли пути
  const lastOfPath1 = path1[path1.length - 1];
  const firstOfPath2 = path2[0];

  if (positionEquals(lastOfPath1, firstOfPath2)) {
    return [...path1, ...path2.slice(1)];
  }

  return [...path1, ...path2];
};

/**
 * Инвертировать путь
 */
export const reversePath = (path: Position[]): Position[] => {
  return [...path].reverse();
};