/**
 * Алгоритм правой руки для решения лабиринта
 * Следует вдоль правой стены до достижения выхода
 */

import {
  Maze,
  MazeSolver,
  SolvingStep,
  Position,
  Direction,
  positionEquals,
  turnRight,
  turnLeft,
  getNextPosition,
} from '../../types';
import { canMove } from '../../utils';

export class RightHandSolver implements MazeSolver {
  private currentDirection: Direction = 'up';
  private visitedPositions: Set<string>;
  private maxSteps: number = 10000; // Защита от бесконечных циклов

  constructor() {
    this.visitedPositions = new Set();
  }

  /**
   * Решить лабиринт алгоритмом правой руки
   */
  async solve(
    maze: Maze,
    start: Position,
    end: Position,
    onStep?: (step: SolvingStep) => Promise<void>
  ): Promise<Position[]> {
    const path: Position[] = [start];
    let currentPosition = { ...start };
    this.visitedPositions.clear();
    
    // Определяем начальное направление (от старта к центру)
    this.currentDirection = this.getInitialDirection(start, maze);
    
    let steps = 0;

    while (!positionEquals(currentPosition, end) && steps < this.maxSteps) {
      steps++;

      // 1. Попробовать повернуть направо
      const rightDirection = turnRight(this.currentDirection);
      const rightPosition = getNextPosition(currentPosition, rightDirection);

      if (canMove(maze, currentPosition, rightDirection)) {
        // Можем идти направо - поворачиваем и идем
        this.currentDirection = rightDirection;
        currentPosition = rightPosition;
        path.push({ ...currentPosition });

        if (onStep) {
          await onStep({
            type: 'move',
            position: currentPosition,
            direction: this.currentDirection,
            path: [...path],
            metadata: {
              pathLength: path.length,
              action: 'turn_right_and_move',
            },
          });
        }
      } else {
        // 2. Не можем идти направо, пробуем прямо
        const straightPosition = getNextPosition(currentPosition, this.currentDirection);

        if (canMove(maze, currentPosition, this.currentDirection)) {
          // Идем прямо
          currentPosition = straightPosition;
          path.push({ ...currentPosition });

          if (onStep) {
            await onStep({
              type: 'move',
              position: currentPosition,
              direction: this.currentDirection,
              path: [...path],
              metadata: {
                pathLength: path.length,
                action: 'move_straight',
              },
            });
          }
        } else {
          // 3. Не можем идти прямо, поворачиваем налево
          this.currentDirection = turnLeft(this.currentDirection);

          if (onStep) {
            await onStep({
              type: 'move',
              position: currentPosition,
              direction: this.currentDirection,
              path: [...path],
              metadata: {
                pathLength: path.length,
                action: 'turn_left',
              },
            });
          }

          // Проверяем, можем ли идти после поворота налево
          if (!canMove(maze, currentPosition, this.currentDirection)) {
            // Если и налево нельзя, разворачиваемся
            this.currentDirection = turnLeft(this.currentDirection);
            
            if (onStep) {
              await onStep({
                type: 'move',
                position: currentPosition,
                direction: this.currentDirection,
                path: [...path],
                metadata: {
                  pathLength: path.length,
                  action: 'turn_around',
                },
              });
            }
          }
        }
      }

      // Отмечаем позицию как посещенную
      this.visitedPositions.add(this.positionToString(currentPosition));
    }

    // Проверяем, достигли ли мы цели
    if (!positionEquals(currentPosition, end)) {
      console.warn('Right hand algorithm failed to find exit');
      return [];
    }

    if (onStep) {
      await onStep({
        type: 'path_found',
        position: currentPosition,
        path: [...path],
        metadata: {
          pathLength: path.length,
          totalSteps: steps,
        },
      });
    }

    return path;
  }

  /**
   * Определить начальное направление движения
   */
  private getInitialDirection(start: Position, maze: Maze): Direction {
    // Пробуем направления в порядке приоритета
    const directions: Direction[] = ['right', 'down', 'left', 'up'];

    for (const direction of directions) {
      if (canMove(maze, start, direction)) {
        return direction;
      }
    }

    return 'right'; // По умолчанию
  }

  /**
   * Преобразовать позицию в строку
   */
  private positionToString(pos: Position): string {
    return `${pos.x},${pos.y}`;
  }

  /**
   * Получить статистику решения
   */
  getStatistics(): {
    visitedCells: number;
    currentDirection: Direction;
  } {
    return {
      visitedCells: this.visitedPositions.size,
      currentDirection: this.currentDirection,
    };
  }

  /**
   * Сбросить состояние решателя
   */
  reset(): void {
    this.visitedPositions.clear();
    this.currentDirection = 'up';
  }
}