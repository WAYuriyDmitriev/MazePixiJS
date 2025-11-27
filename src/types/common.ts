/**
 * Общие типы данных, используемые во всем приложении
 */

/**
 * Позиция на сетке лабиринта
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * Размер сетки
 */
export interface Size {
  width: number;
  height: number;
}

/**
 * Направление движения
 */
export type Direction = 'up' | 'down' | 'left' | 'right';

/**
 * Состояние анимации
 */
export interface AnimationState {
  isPlaying: boolean;
  speed: number;
  currentStep: number;
  totalSteps: number;
}

/**
 * Вспомогательные функции для работы с позициями
 */
export const positionEquals = (a: Position, b: Position): boolean => {
  return a.x === b.x && a.y === b.y;
};

export const positionToString = (pos: Position): string => {
  return `${pos.x},${pos.y}`;
};

export const stringToPosition = (str: string): Position => {
  const [x, y] = str.split(',').map(Number);
  return { x, y };
};

/**
 * Получить следующую позицию в заданном направлении
 */
export const getNextPosition = (pos: Position, direction: Direction): Position => {
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
 * Повернуть направо
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
 * Повернуть налево
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