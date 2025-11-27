/**
 * Типы данных для игрока и системы следов
 */

import { Position, Direction } from './common';

/**
 * Игрок
 */
export interface Player {
  position: Position;
  previousPosition: Position | null;
  isMoving: boolean;
  movementHistory: Position[];
  hasReachedEnd: boolean;
  direction: Direction;
}

/**
 * След движения игрока
 */
export interface Trail {
  id: string;
  from: Position;
  to: Position;
  timestamp: number;
  color: number;
  alpha: number;
  isActive: boolean;
}

/**
 * Система следов
 */
export interface TrailSystem {
  trails: Trail[];
  maxTrails: number;
  fadeSpeed: number;
  colorGradient: number[];
}

/**
 * Создать нового игрока
 */
export const createPlayer = (startPosition: Position): Player => {
  return {
    position: startPosition,
    previousPosition: null,
    isMoving: false,
    movementHistory: [startPosition],
    hasReachedEnd: false,
    direction: 'right',
  };
};

/**
 * Создать новый след
 */
export const createTrail = (
  from: Position,
  to: Position,
  color: number,
  timestamp: number = Date.now()
): Trail => {
  return {
    id: `${from.x},${from.y}-${to.x},${to.y}-${timestamp}`,
    from,
    to,
    timestamp,
    color,
    alpha: 1,
    isActive: true,
  };
};

/**
 * Создать систему следов
 */
export const createTrailSystem = (
  maxTrails: number = 1000,
  fadeSpeed: number = 0.02,
  colorGradient: number[] = [0x4CAF50, 0x8BC34A, 0xCDDC39]
): TrailSystem => {
  return {
    trails: [],
    maxTrails,
    fadeSpeed,
    colorGradient,
  };
};

/**
 * Проверить, является ли движение возвратом
 */
export const isBacktracking = (
  newPosition: Position,
  movementHistory: Position[]
): boolean => {
  if (movementHistory.length < 2) {
    return false;
  }

  const previousPosition = movementHistory[movementHistory.length - 2];
  return previousPosition.x === newPosition.x && previousPosition.y === newPosition.y;
};

/**
 * Получить цвет следа на основе градиента
 */
export const getTrailColor = (
  index: number,
  totalTrails: number,
  colorGradient: number[]
): number => {
  if (colorGradient.length === 0) {
    return 0x4CAF50;
  }

  if (colorGradient.length === 1) {
    return colorGradient[0];
  }

  const position = (index / Math.max(totalTrails - 1, 1)) * (colorGradient.length - 1);
  const lowerIndex = Math.floor(position);
  const upperIndex = Math.min(lowerIndex + 1, colorGradient.length - 1);
  const t = position - lowerIndex;

  const lowerColor = colorGradient[lowerIndex];
  const upperColor = colorGradient[upperIndex];

  // Интерполяция цветов
  const r1 = (lowerColor >> 16) & 0xff;
  const g1 = (lowerColor >> 8) & 0xff;
  const b1 = lowerColor & 0xff;

  const r2 = (upperColor >> 16) & 0xff;
  const g2 = (upperColor >> 8) & 0xff;
  const b2 = upperColor & 0xff;

  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);

  return (r << 16) | (g << 8) | b;
};