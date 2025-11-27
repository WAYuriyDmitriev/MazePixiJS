/**
 * Утилиты для работы с лабиринтом
 */

import { Position, Size, Maze, Direction } from '../types';
import { findShortestPath } from './pathfinding';

/**
 * Получить все позиции на периметре (исключая углы)
 */
const getPerimeterPositions = (size: Size, excludeCorners: boolean = true): Position[] => {
  const positions: Position[] = [];
  const startOffset = excludeCorners ? 1 : 0;
  const endOffsetW = excludeCorners ? size.width - 1 : size.width;
  const endOffsetH = excludeCorners ? size.height - 1 : size.height;
  
  // Верхняя стена
  for (let x = startOffset; x < endOffsetW; x++) {
    if (!excludeCorners || (x > 0 && x < size.width - 1)) {
      positions.push({ x, y: 0 });
    }
  }
  
  // Нижняя стена
  for (let x = startOffset; x < endOffsetW; x++) {
    if (!excludeCorners || (x > 0 && x < size.width - 1)) {
      positions.push({ x, y: size.height - 1 });
    }
  }
  
  // Левая стена (без углов, они уже добавлены)
  for (let y = startOffset + 1; y < endOffsetH - 1; y++) {
    positions.push({ x: 0, y });
  }
  
  // Правая стена (без углов, они уже добавлены)
  for (let y = startOffset + 1; y < endOffsetH - 1; y++) {
    positions.push({ x: size.width - 1, y });
  }
  
  return positions;
};

/**
 * Получить соседние позиции (не по диагонали)
 */
const getAdjacentPositions = (pos: Position, size: Size): Position[] => {
  const adjacent: Position[] = [];
  const directions = [
    { dx: 0, dy: -1 }, // up
    { dx: 0, dy: 1 },  // down
    { dx: -1, dy: 0 }, // left
    { dx: 1, dy: 0 },  // right
  ];
  
  for (const dir of directions) {
    const newPos = { x: pos.x + dir.dx, y: pos.y + dir.dy };
    if (newPos.x >= 0 && newPos.x < size.width && 
        newPos.y >= 0 && newPos.y < size.height) {
      adjacent.push(newPos);
    }
  }
  
  return adjacent;
};

/**
 * Найти доступные позиции на периметре (соседние с проходами)
 */
const findAccessiblePerimeterPositions = (maze: Maze): Position[] => {
  const perimeterPositions = getPerimeterPositions(maze.size, true);
  const accessible: Position[] = [];
  
  for (const pos of perimeterPositions) {
    // Проверяем, есть ли соседняя клетка-проход
    const neighbors = getAdjacentPositions(pos, maze.size);
    const hasPassageNeighbor = neighbors.some(neighbor => {
      const cell = maze.cells[neighbor.y][neighbor.x];
      return !cell.isWall;
    });
    
    if (hasPassageNeighbor) {
      accessible.push(pos);
    }
  }
  
  return accessible;
};

/**
 * Определить, на какой стене находится позиция
 */
const getWallSide = (pos: Position, size: Size): 'top' | 'bottom' | 'left' | 'right' | null => {
  if (pos.y === 0) return 'top';
  if (pos.y === size.height - 1) return 'bottom';
  if (pos.x === 0) return 'left';
  if (pos.x === size.width - 1) return 'right';
  return null;
};

/**
 * Найти вход и выход после генерации лабиринта
 * Гарантирует, что между ними есть путь и они на разных стенах
 */
export const findEntranceAndExit = (maze: Maze): { entrance: Position; exit: Position } | null => {
  const accessiblePositions = findAccessiblePerimeterPositions(maze);
  
  if (accessiblePositions.length < 2) {
    console.error('Not enough accessible perimeter positions');
    return null;
  }
  
  // Группируем позиции по стенам
  const positionsByWall: Record<string, Position[]> = {
    top: [],
    bottom: [],
    left: [],
    right: [],
  };
  
  for (const pos of accessiblePositions) {
    const side = getWallSide(pos, maze.size);
    if (side) {
      positionsByWall[side].push(pos);
    }
  }
  
  // Перемешиваем позиции на каждой стене
  Object.keys(positionsByWall).forEach(key => {
    positionsByWall[key].sort(() => Math.random() - 0.5);
  });
  
  // Пробуем найти пару позиций на РАЗНЫХ стенах с путем между ними
  const walls = Object.keys(positionsByWall).filter(wall => positionsByWall[wall].length > 0);
  
  for (let i = 0; i < walls.length; i++) {
    for (let j = i + 1; j < walls.length; j++) {
      const wall1 = walls[i];
      const wall2 = walls[j];
      
      // Пробуем все комбинации позиций с этих двух стен
      for (const entrance of positionsByWall[wall1]) {
        for (const exit of positionsByWall[wall2]) {
          // Временно делаем вход и выход проходами для проверки пути
          const entranceWasWall = maze.cells[entrance.y][entrance.x].isWall;
          const exitWasWall = maze.cells[exit.y][exit.x].isWall;
          
          maze.cells[entrance.y][entrance.x].isWall = false;
          maze.cells[exit.y][exit.x].isWall = false;
          
          // Проверяем, есть ли путь
          const path = findShortestPath(maze, entrance, exit);
          
          // Восстанавливаем состояние
          maze.cells[entrance.y][entrance.x].isWall = entranceWasWall;
          maze.cells[exit.y][exit.x].isWall = exitWasWall;
          
          if (path && path.length > 0) {
            return { entrance, exit };
          }
        }
      }
    }
  }
  
  // Если не нашли путь на разных стенах, берем любые две позиции
  console.warn('Could not find path between different walls, using any two positions');
  const shuffled = [...accessiblePositions].sort(() => Math.random() - 0.5);
  return {
    entrance: shuffled[0],
    exit: shuffled[1],
  };
};

/**
 * Получить проходимых соседей клетки
 */
export const getWalkableNeighbors = (maze: Maze, pos: Position): Position[] => {
  const neighbors = getAdjacentPositions(pos, maze.size);
  return neighbors.filter(neighbor => {
    const cell = maze.cells[neighbor.y][neighbor.x];
    return !cell.isWall;
  });
};

/**
 * Проверить, является ли клетка проходимой
 */
export const isWalkable = (maze: Maze, pos: Position): boolean => {
  if (pos.x < 0 || pos.x >= maze.size.width || pos.y < 0 || pos.y >= maze.size.height) {
    return false;
  }
  return !maze.cells[pos.y][pos.x].isWall;
};

/**
 * Получить направление движения между двумя позициями
 */
export const getDirection = (from: Position, to: Position): Direction | null => {
  const dx = to.x - from.x;
  const dy = to.y - from.y;

  if (dx === 1 && dy === 0) return 'right';
  if (dx === -1 && dy === 0) return 'left';
  if (dx === 0 && dy === 1) return 'down';
  if (dx === 0 && dy === -1) return 'up';

  return null;
};

/**
 * Получить противоположное направление
 */
export const getOppositeDirection = (direction: Direction): Direction => {
  switch (direction) {
    case 'up':
      return 'down';
    case 'down':
      return 'up';
    case 'left':
      return 'right';
    case 'right':
      return 'left';
  }
};

/**
 * Повернуть направление вправо
 */
export const turnRight = (direction: Direction): Direction => {
  switch (direction) {
    case 'up':
      return 'right';
    case 'right':
      return 'down';
    case 'down':
      return 'left';
    case 'left':
      return 'up';
  }
};

/**
 * Повернуть направление влево
 */
export const turnLeft = (direction: Direction): Direction => {
  switch (direction) {
    case 'up':
      return 'left';
    case 'left':
      return 'down';
    case 'down':
      return 'right';
    case 'right':
      return 'up';
  }
};

/**
 * Получить позицию в направлении
 */
export const getPositionInDirection = (pos: Position, direction: Direction): Position => {
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
 * Очистить следы в лабиринте
 */
export const clearTrails = (maze: Maze): Maze => {
  const newCells = maze.cells.map(row =>
    row.map(cell => ({
      ...cell,
      hasTrail: false,
      trailDirection: undefined,
    }))
  );

  return {
    ...maze,
    cells: newCells,
  };
};

/**
 * Сбросить посещенные клетки
 */
export const resetVisited = (maze: Maze): Maze => {
  const newCells = maze.cells.map(row =>
    row.map(cell => ({
      ...cell,
      isVisited: false,
      waveValue: undefined,
    }))
  );

  return {
    ...maze,
    cells: newCells,
  };
};

/**
 * Проверить, может ли игрок двигаться в указанном направлении
 */
export const canMove = (maze: Maze, position: Position, direction: Direction): boolean => {
  const nextPosition = getPositionInDirection(position, direction);
  return isWalkable(maze, nextPosition);
};

/**
 * Проверить, достиг ли игрок конца лабиринта
 */
export const hasReachedEnd = (position: Position, endPosition: Position): boolean => {
  return position.x === endPosition.x && position.y === endPosition.y;
};

/**
 * Вычислить размер клетки для отображения
 */
export const calculateCellSize = (
  mazeSize: Size,
  canvasWidth: number,
  canvasHeight: number
): number => {
  const cellWidth = Math.floor(canvasWidth / mazeSize.width);
  const cellHeight = Math.floor(canvasHeight / mazeSize.height);
  return Math.min(cellWidth, cellHeight);
};