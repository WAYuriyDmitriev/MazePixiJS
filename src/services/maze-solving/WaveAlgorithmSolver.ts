/**
 * Волновой алгоритм (алгоритм Ли) для решения лабиринта
 * Находит кратчайший путь от старта до финиша
 */

import {
  Maze,
  MazeSolver,
  SolvingStep,
  Position,
  positionEquals,
} from '../../types';
import { getWalkableNeighbors } from '../../utils';

export class WaveAlgorithmSolver implements MazeSolver {
  private waveMap: number[][];
  private queue: Position[];

  constructor() {
    this.waveMap = [];
    this.queue = [];
  }

  /**
   * Решить лабиринт волновым алгоритмом
   */
  async solve(
    maze: Maze,
    start: Position,
    end: Position,
    onStep?: (step: SolvingStep) => Promise<void>
  ): Promise<Position[]> {
    // 1. Инициализация волновой карты
    this.initializeWaveMap(maze);

    // 2. Начинаем волну от конца (чтобы потом идти по убыванию)
    this.waveMap[end.y][end.x] = 0;
    this.queue = [end];

    if (onStep) {
      await onStep({
        type: 'wave_spread',
        position: end,
        waveValue: 0,
        path: [end],
        metadata: {
          queueSize: this.queue.length,
          phase: 'initialization',
        },
      });
    }

    // 3. Распространение волны С ВИЗУАЛИЗАЦИЕЙ
    let waveValue = 0;
    let foundStart = false;

    while (this.queue.length > 0 && !foundStart) {
      const currentWave = [...this.queue];
      this.queue = [];
      const nextWaveFront: Position[] = []; // Клетки следующей волны для визуализации

      for (const position of currentWave) {
        // Проверяем, достигли ли старта
        if (positionEquals(position, start)) {
          foundStart = true;
        }

        // Получаем соседей
        const neighbors = getWalkableNeighbors(maze, position);

        for (const neighbor of neighbors) {
          // Если клетка еще не посещена
          if (this.waveMap[neighbor.y][neighbor.x] === -1) {
            this.waveMap[neighbor.y][neighbor.x] = waveValue + 1;
            this.queue.push(neighbor);
            nextWaveFront.push(neighbor);
          }
        }
      }

      // Визуализация текущего фронта волны (один раз за итерацию)
      if (onStep && nextWaveFront.length > 0) {
        await onStep({
          type: 'wave_spread',
          position: nextWaveFront[0], // Любая позиция из фронта
          waveValue: waveValue + 1,
          path: nextWaveFront, // Передаем только текущий фронт волны
          metadata: {
            queueSize: this.queue.length,
            phase: 'wave_spreading',
            currentWave: waveValue + 1,
          },
        });
      }

      waveValue++;
    }

    // 4. Проверяем, найден ли путь
    if (this.waveMap[start.y][start.x] === -1) {
      console.warn('Wave algorithm: no path found');
      return [];
    }

    // 5. Построение пути от старта к концу
    const path = await this.buildPath(maze, start, end, onStep);

    if (onStep) {
      await onStep({
        type: 'path_found',
        position: end,
        path: [...path],
        metadata: {
          pathLength: path.length,
          optimalPath: true,
        },
      });
    }

    return path;
  }

  /**
   * Инициализировать волновую карту
   */
  private initializeWaveMap(maze: Maze): void {
    this.waveMap = [];

    for (let y = 0; y < maze.size.height; y++) {
      this.waveMap[y] = [];
      for (let x = 0; x < maze.size.width; x++) {
        // -1 означает непосещенную клетку
        // Стены остаются -1 навсегда
        this.waveMap[y][x] = maze.cells[y][x].isWall ? -2 : -1;
      }
    }
  }

  /**
   * Построить путь от старта к концу по волновой карте
   */
  private async buildPath(
    maze: Maze,
    start: Position,
    end: Position,
    onStep?: (step: SolvingStep) => Promise<void>
  ): Promise<Position[]> {
    const path: Position[] = [];
    let current = { ...start };

    while (!positionEquals(current, end)) {
      path.push({ ...current });

      // Визуализация текущего шага
      if (onStep) {
        await onStep({
          type: 'move',
          position: current,
          waveValue: this.waveMap[current.y][current.x],
          path: [...path],
          metadata: {
            pathLength: path.length,
            phase: 'path_building',
          },
        });
      }

      // Найти соседа с наименьшим значением волны
      const neighbors = getWalkableNeighbors(maze, current);
      let bestNeighbor: Position | null = null;
      let bestValue = Infinity;

      for (const neighbor of neighbors) {
        const value = this.waveMap[neighbor.y][neighbor.x];
        
        // Ищем соседа с меньшим значением (ближе к цели)
        if (value >= 0 && value < bestValue) {
          bestNeighbor = neighbor;
          bestValue = value;
        }
      }

      if (!bestNeighbor) {
        console.error('Wave algorithm: path reconstruction failed');
        console.log('Current position:', current);
        console.log('Wave map value:', this.waveMap[current.y][current.x]);
        console.log('Neighbors:', neighbors);
        return path;
      }

      current = bestNeighbor;
    }

    path.push({ ...end });
    
    // Финальная визуализация
    if (onStep) {
      await onStep({
        type: 'move',
        position: end,
        waveValue: 0,
        path: [...path],
        metadata: {
          pathLength: path.length,
          phase: 'path_building',
        },
      });
    }

    return path;
  }

  /**
   * Получить волновую карту (для отладки/визуализации)
   */
  getWaveMap(): number[][] {
    return this.waveMap;
  }

  /**
   * Получить значение волны для позиции
   */
  getWaveValue(position: Position): number {
    if (
      position.y >= 0 &&
      position.y < this.waveMap.length &&
      position.x >= 0 &&
      position.x < this.waveMap[0].length
    ) {
      return this.waveMap[position.y][position.x];
    }
    return -1;
  }

  /**
   * Получить статистику решения
   */
  getStatistics(): {
    maxWaveValue: number;
    visitedCells: number;
    totalCells: number;
  } {
    let maxWaveValue = 0;
    let visitedCells = 0;
    let totalCells = 0;

    for (const row of this.waveMap) {
      for (const value of row) {
        totalCells++;
        if (value >= 0) {
          visitedCells++;
          maxWaveValue = Math.max(maxWaveValue, value);
        }
      }
    }

    return {
      maxWaveValue,
      visitedCells,
      totalCells,
    };
  }

  /**
   * Сбросить состояние решателя
   */
  reset(): void {
    this.waveMap = [];
    this.queue = [];
  }
}