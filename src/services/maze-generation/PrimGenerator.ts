/**
 * Генератор лабиринтов с использованием алгоритма Прима
 * Создает лабиринт через расширение от случайной начальной клетки
 */

import {
  Maze,
  MazeGenerator,
  GenerationStep,
  Position,
  createEmptyMaze,
} from '../../types';
import { findEntranceAndExit } from '../../utils';

interface Wall {
  position: Position;
  connects: Position; // Клетка, которую эта стена соединяет с лабиринтом
}

export class PrimGenerator implements MazeGenerator {
  private frontierWalls: Wall[];
  private inMaze: Set<string>;
  private maze: Maze | null = null;

  constructor() {
    this.frontierWalls = [];
    this.inMaze = new Set();
  }

  /**
   * Генерировать лабиринт
   */
  async generate(
    width: number,
    height: number,
    onStep?: (step: GenerationStep) => Promise<void>
  ): Promise<Maze> {
    // 1. Создать пустой лабиринт (все стены)
    this.maze = createEmptyMaze({ width, height });
    this.frontierWalls = [];
    this.inMaze.clear();

    // 2. Начать со случайной клетки (внутри периметра)
    const startCell = this.getRandomCell(width, height);
    this.addToMaze(startCell);

    // Визуализация начальной клетки
    if (onStep) {
      await onStep({
        type: 'cell_visited',
        position: startCell,
        maze: { ...this.maze, cells: this.maze.cells.map(row => [...row]) },
        metadata: {
          frontierSize: this.frontierWalls.length,
          mazeSize: this.inMaze.size,
        },
      });
    }

    // 3. Добавить соседние стены в frontier
    this.addFrontierWalls(startCell);

    // 4. Основной цикл алгоритма Прима
    while (this.frontierWalls.length > 0) {
      // Выбрать случайную стену из frontier
      const wallIndex = Math.floor(Math.random() * this.frontierWalls.length);
      const wall = this.frontierWalls[wallIndex];
      this.frontierWalls.splice(wallIndex, 1);

      // Проверяем, не добавлена ли уже клетка в лабиринт
      const cellKey = this.positionToKey(wall.connects);
      if (this.inMaze.has(cellKey)) {
        continue;
      }

      // Добавить клетку в лабиринт
      this.addToMaze(wall.connects);

      // Убрать стену между клетками
      this.maze.cells[wall.position.y][wall.position.x].isWall = false;

      // Добавить новые frontier стены
      this.addFrontierWalls(wall.connects);

      // Визуализация шага
      if (onStep) {
        await onStep({
          type: 'path_created',
          position: wall.connects,
          connectedPosition: wall.position,
          maze: { ...this.maze, cells: this.maze.cells.map(row => [...row]) },
          metadata: {
            frontierSize: this.frontierWalls.length,
            mazeSize: this.inMaze.size,
          },
        });
      }
    }

    // 5. Убрать лишнюю стену справа и снизу для четных размеров
    // Для размера 30: последний проход на 27, стена на 28, периметр на 29
    // Нужно убрать стену на 28, чтобы был только периметр на 29
    if (width % 2 === 0) {
      for (let y = 1; y < height - 1; y += 2) {
        // Убираем стену между последним проходом и периметром
        this.maze.cells[y][width - 2].isWall = false;
      }
    }
    
    if (height % 2 === 0) {
      for (let x = 1; x < width - 1; x += 2) {
        // Убираем стену между последним проходом и периметром
        this.maze.cells[height - 2][x].isWall = false;
      }
    }

    // 6. Найти вход и выход ПОСЛЕ генерации лабиринта
    const entranceExit = findEntranceAndExit(this.maze);
    
    if (entranceExit) {
      this.maze.startPosition = entranceExit.entrance;
      this.maze.endPosition = entranceExit.exit;
      // Делаем вход и выход проходами
      this.maze.cells[entranceExit.entrance.y][entranceExit.entrance.x].isWall = false;
      this.maze.cells[entranceExit.exit.y][entranceExit.exit.x].isWall = false;
    } else {
      console.error('Failed to find entrance and exit');
    }

    // 7. Пометить лабиринт как завершенный
    this.maze.isComplete = true;
    this.maze.generationType = 'prim';

    return this.maze;
  }

  /**
   * Получить случайную клетку (внутри периметра, на нечетных координатах)
   */
  private getRandomCell(width: number, height: number): Position {
    // Генерируем нечетные координаты внутри периметра
    // Используем width-2 и height-2 как максимальные координаты для одинарного периметра
    const maxOddX = width - 2;
    const maxOddY = height - 2;
    const oddX = Math.floor(Math.random() * Math.floor(maxOddX / 2)) * 2 + 1;
    const oddY = Math.floor(Math.random() * Math.floor(maxOddY / 2)) * 2 + 1;
    return {
      x: Math.min(oddX, maxOddX),
      y: Math.min(oddY, maxOddY),
    };
  }

  /**
   * Добавить клетку в лабиринт
   */
  private addToMaze(position: Position): void {
    const key = this.positionToKey(position);
    this.inMaze.add(key);

    if (this.maze) {
      this.maze.cells[position.y][position.x].isVisited = true;
      this.maze.cells[position.y][position.x].isWall = false;
    }
  }

  /**
   * Добавить соседние стены в frontier (не трогая периметр)
   */
  private addFrontierWalls(position: Position): void {
    if (!this.maze) return;

    const directions = [
      { dx: 0, dy: -2, wallDx: 0, wallDy: -1 }, // Вверх
      { dx: 0, dy: 2, wallDx: 0, wallDy: 1 },   // Вниз
      { dx: -2, dy: 0, wallDx: -1, wallDy: 0 }, // Влево
      { dx: 2, dy: 0, wallDx: 1, wallDy: 0 },   // Вправо
    ];

    for (const dir of directions) {
      const neighbor: Position = {
        x: position.x + dir.dx,
        y: position.y + dir.dy,
      };

      const wall: Position = {
        x: position.x + dir.wallDx,
        y: position.y + dir.wallDy,
      };

      // Проверяем границы И что не на периметре
      if (this.isValidPosition(neighbor) && this.isValidPosition(wall) &&
          !this.isOnPerimeter(neighbor) && !this.isOnPerimeter(wall)) {
        const key = this.positionToKey(neighbor);

        // Если клетка еще не в лабиринте
        if (!this.inMaze.has(key)) {
          // Проверяем, нет ли уже такой стены в frontier
          const wallExists = this.frontierWalls.some(
            w => w.position.x === wall.x && w.position.y === wall.y &&
                 w.connects.x === neighbor.x && w.connects.y === neighbor.y
          );

          if (!wallExists) {
            this.frontierWalls.push({
              position: wall,
              connects: neighbor,
            });
          }
        }
      }
    }
  }

  /**
   * Проверить, является ли позиция валидной
   */
  private isValidPosition(position: Position): boolean {
    if (!this.maze) return false;

    return (
      position.x >= 0 &&
      position.x < this.maze.size.width &&
      position.y >= 0 &&
      position.y < this.maze.size.height
    );
  }

  /**
   * Проверить, находится ли позиция на периметре
   */
  private isOnPerimeter(position: Position): boolean {
    if (!this.maze) return false;

    return (
      position.x === 0 ||
      position.x === this.maze.size.width - 1 ||
      position.y === 0 ||
      position.y === this.maze.size.height - 1
    );
  }

  /**
   * Преобразовать позицию в ключ
   */
  private positionToKey(position: Position): string {
    return `${position.x},${position.y}`;
  }

  /**
   * Получить статистику генерации
   */
  getStatistics(): {
    frontierSize: number;
    mazeSize: number;
    totalCells: number;
  } {
    return {
      frontierSize: this.frontierWalls.length,
      mazeSize: this.inMaze.size,
      totalCells: this.maze
        ? this.maze.size.width * this.maze.size.height
        : 0,
    };
  }
}