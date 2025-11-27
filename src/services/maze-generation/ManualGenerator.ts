/**
 * Ручной генератор лабиринтов
 * Позволяет пользователю создавать лабиринт интерактивно
 */

import {
  Maze,
  MazeGenerator,
  GenerationStep,
  Position,
  createEmptyMaze,
} from '../../types';
import { findEntranceAndExit } from '../../utils';

export class ManualGenerator implements MazeGenerator {
  private maze: Maze | null = null;

  /**
   * Создать пустой лабиринт для ручного редактирования
   */
  async generate(
    width: number,
    height: number,
    onStep?: (step: GenerationStep) => Promise<void>
  ): Promise<Maze> {
    // Создать пустой лабиринт (все стены)
    this.maze = createEmptyMaze({ width, height });

    // Временные позиции старта и конца (будут обновлены при завершении)
    this.maze.startPosition = { x: 1, y: 1 };
    this.maze.endPosition = { x: width - 2, y: height - 2 };

    // Пометить как ручной режим
    this.maze.generationType = 'manual';
    this.maze.isComplete = false; // Пользователь должен завершить создание

    // Визуализация начального состояния
    if (onStep) {
      await onStep({
        type: 'cell_visited',
        position: this.maze.startPosition,
        metadata: {
          mode: 'manual',
          message: 'Кликайте по клеткам для создания пути',
        },
      });
    }

    return this.maze;
  }

  /**
   * Переключить состояние клетки (стена/путь)
   */
  toggleCell(position: Position): Maze | null {
    if (!this.maze) return null;

    const { x, y } = position;

    // Проверяем границы
    if (
      x < 0 ||
      x >= this.maze.size.width ||
      y < 0 ||
      y >= this.maze.size.height
    ) {
      return this.maze;
    }

    // Не позволяем изменять старт и конец
    if (
      (this.maze.startPosition && x === this.maze.startPosition.x && y === this.maze.startPosition.y) ||
      (this.maze.endPosition && x === this.maze.endPosition.x && y === this.maze.endPosition.y)
    ) {
      return this.maze;
    }

    // Переключаем состояние клетки
    this.maze.cells[y][x].isWall = !this.maze.cells[y][x].isWall;

    return this.maze;
  }

  /**
   * Установить клетку как стену
   */
  setWall(position: Position): Maze | null {
    if (!this.maze) return null;

    const { x, y } = position;

    if (
      x >= 0 &&
      x < this.maze.size.width &&
      y >= 0 &&
      y < this.maze.size.height
    ) {
      // Не позволяем изменять старт и конец
      if (
        (this.maze.startPosition && x === this.maze.startPosition.x && y === this.maze.startPosition.y) ||
        (this.maze.endPosition && x === this.maze.endPosition.x && y === this.maze.endPosition.y)
      ) {
        return this.maze;
      }

      this.maze.cells[y][x].isWall = true;
    }

    return this.maze;
  }

  /**
   * Установить клетку как путь
   */
  setPath(position: Position): Maze | null {
    if (!this.maze) return null;

    const { x, y } = position;

    if (
      x >= 0 &&
      x < this.maze.size.width &&
      y >= 0 &&
      y < this.maze.size.height
    ) {
      this.maze.cells[y][x].isWall = false;
    }

    return this.maze;
  }

  /**
   * Очистить лабиринт (сделать все клетки стенами)
   */
  clear(): Maze | null {
    if (!this.maze) return null;

    for (let y = 0; y < this.maze.size.height; y++) {
      for (let x = 0; x < this.maze.size.width; x++) {
        // Не трогаем старт и конец
        if (
          (this.maze.startPosition && x === this.maze.startPosition.x && y === this.maze.startPosition.y) ||
          (this.maze.endPosition && x === this.maze.endPosition.x && y === this.maze.endPosition.y)
        ) {
          this.maze.cells[y][x].isWall = false;
        } else {
          this.maze.cells[y][x].isWall = true;
        }
      }
    }

    return this.maze;
  }

  /**
   * Заполнить лабиринт (сделать все клетки путями)
   */
  fill(): Maze | null {
    if (!this.maze) return null;

    for (let y = 0; y < this.maze.size.height; y++) {
      for (let x = 0; x < this.maze.size.width; x++) {
        this.maze.cells[y][x].isWall = false;
      }
    }

    return this.maze;
  }

  /**
   * Инвертировать лабиринт (стены становятся путями и наоборот)
   */
  invert(): Maze | null {
    if (!this.maze) return null;

    for (let y = 0; y < this.maze.size.height; y++) {
      for (let x = 0; x < this.maze.size.width; x++) {
        // Не трогаем старт и конец
        if (
          (this.maze.startPosition && x === this.maze.startPosition.x && y === this.maze.startPosition.y) ||
          (this.maze.endPosition && x === this.maze.endPosition.x && y === this.maze.endPosition.y)
        ) {
          this.maze.cells[y][x].isWall = false;
        } else {
          this.maze.cells[y][x].isWall = !this.maze.cells[y][x].isWall;
        }
      }
    }

    return this.maze;
  }

  /**
   * Завершить создание лабиринта
   * Автоматически находит вход и выход на периметре
   */
  complete(): Maze | null {
    if (!this.maze) return null;

    // Найти вход и выход на периметре после создания лабиринта
    const entranceExit = findEntranceAndExit(this.maze);
    
    if (entranceExit) {
      this.maze.startPosition = entranceExit.entrance;
      this.maze.endPosition = entranceExit.exit;
      // Делаем вход и выход проходами
      this.maze.cells[entranceExit.entrance.y][entranceExit.entrance.x].isWall = false;
      this.maze.cells[entranceExit.exit.y][entranceExit.exit.x].isWall = false;
    } else {
      console.error('Failed to find entrance and exit for manual maze');
    }

    this.maze.isComplete = true;
    return this.maze;
  }

  /**
   * Получить текущий лабиринт
   */
  getMaze(): Maze | null {
    return this.maze;
  }

  /**
   * Проверить, валиден ли лабиринт (есть ли путь от старта до конца)
   */
  isValid(): boolean {
    if (!this.maze || !this.maze.startPosition || !this.maze.endPosition) return false;

    const visited = new Set<string>();
    const queue: Position[] = [this.maze.startPosition];
    visited.add(`${this.maze.startPosition.x},${this.maze.startPosition.y}`);

    while (queue.length > 0) {
      const current = queue.shift()!;

      // Достигли конца
      if (
        current.x === this.maze.endPosition.x &&
        current.y === this.maze.endPosition.y
      ) {
        return true;
      }

      // Проверяем соседей
      const directions = [
        { x: 0, y: -1 }, // Вверх
        { x: 0, y: 1 },  // Вниз
        { x: -1, y: 0 }, // Влево
        { x: 1, y: 0 },  // Вправо
      ];

      for (const dir of directions) {
        const next: Position = {
          x: current.x + dir.x,
          y: current.y + dir.y,
        };

        // Проверяем границы
        if (
          next.x >= 0 &&
          next.x < this.maze.size.width &&
          next.y >= 0 &&
          next.y < this.maze.size.height
        ) {
          const key = `${next.x},${next.y}`;
          const cell = this.maze.cells[next.y][next.x];

          // Если клетка не стена и не посещена
          if (!cell.isWall && !visited.has(key)) {
            visited.add(key);
            queue.push(next);
          }
        }
      }
    }

    return false;
  }
}