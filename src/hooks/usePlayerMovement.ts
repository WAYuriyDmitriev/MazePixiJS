/**
 * Хук для управления движением игрока
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Player,
  Maze,
  Position,
  Direction,
  Trail,
  createPlayer,
  createTrail,
  isBacktracking,
  getTrailColor,
} from '../types';
import { canMove, hasReachedEnd } from '../utils';

interface UsePlayerMovementResult {
  player: Player;
  trails: Trail[];
  movePlayer: (direction: Direction) => boolean;
  resetPlayer: () => void;
  setPlayerPosition: (position: Position) => void;
}

export const usePlayerMovement = (
  maze: Maze | null
): UsePlayerMovementResult => {
  const [player, setPlayer] = useState<Player>(() =>
    maze && maze.startPosition ? createPlayer(maze.startPosition) : createPlayer({ x: 0, y: 0 })
  );
  const [trails, setTrails] = useState<Trail[]>([]);
  const trailColorGradient = useRef<number[]>([0x4caf50, 0x8bc34a, 0xcddc39]);

  // Сбрасываем игрока при изменении лабиринта
  useEffect(() => {
    if (maze && maze.startPosition) {
      setPlayer(createPlayer(maze.startPosition));
      setTrails([]);
    }
  }, [maze?.startPosition?.x, maze?.startPosition?.y]);

  /**
   * Переместить игрока в заданном направлении
   */
  const movePlayer = useCallback(
    (direction: Direction): boolean => {
      if (!maze) return false;

      // Проверяем, можно ли двигаться
      if (!canMove(maze, player.position, direction)) {
        return false;
      }

      setPlayer((prevPlayer) => {
        // Вычисляем новую позицию
        const newPosition: Position = {
          x:
            prevPlayer.position.x +
            (direction === 'left' ? -1 : direction === 'right' ? 1 : 0),
          y:
            prevPlayer.position.y +
            (direction === 'up' ? -1 : direction === 'down' ? 1 : 0),
        };

        // Проверяем, возвращаемся ли мы назад
        const isGoingBack = isBacktracking(newPosition, prevPlayer.movementHistory);

        if (isGoingBack) {
          // Удаляем последний след
          setTrails((prevTrails) => prevTrails.slice(0, -1));

          // Удаляем последнюю позицию из истории
          const newHistory = prevPlayer.movementHistory.slice(0, -1);

          return {
            ...prevPlayer,
            position: newPosition,
            previousPosition: prevPlayer.position,
            movementHistory: newHistory,
            direction,
          };
        } else {
          // Добавляем новый след
          const trailColor = getTrailColor(
            trails.length,
            trails.length + 1,
            trailColorGradient.current
          );

          const newTrail = createTrail(
            prevPlayer.position,
            newPosition,
            trailColor
          );

          setTrails((prevTrails) => [...prevTrails, newTrail]);

          // Добавляем новую позицию в историю
          const newHistory = [...prevPlayer.movementHistory, newPosition];

          return {
            ...prevPlayer,
            position: newPosition,
            previousPosition: prevPlayer.position,
            movementHistory: newHistory,
            hasReachedEnd: maze.endPosition ? hasReachedEnd(newPosition, maze.endPosition) : false,
            direction,
          };
        }
      });

      return true;
    },
    [maze, player.position, trails.length]
  );

  /**
   * Сбросить игрока в начальную позицию
   */
  const resetPlayer = useCallback(() => {
    if (maze && maze.startPosition) {
      setPlayer(createPlayer(maze.startPosition));
      setTrails([]);
    }
  }, [maze]);

  /**
   * Установить позицию игрока
   */
  const setPlayerPosition = useCallback((position: Position) => {
    setPlayer((prevPlayer) => ({
      ...prevPlayer,
      position,
      previousPosition: prevPlayer.position,
    }));
  }, []);

  return {
    player,
    trails,
    movePlayer,
    resetPlayer,
    setPlayerPosition,
  };
};