/**
 * Генератор лабиринтов с использованием алгоритма Краскала
 * Создает лабиринт через построение минимального остовного дерева
 */

import {
  Maze,
  MazeGenerator,
  GenerationStep,
  Edge,
  Position,
  createEmptyMaze,
} from '../../types';
import { DisjointSet } from './DisjointSet';
import { findEntranceAndExit } from '../../utils';

export class KruskalGenerator implements MazeGenerator {
  private disjointSet: DisjointSet;
  private edges: Edge[];

  constructor() {
    this.disjointSet = new DisjointSet();
    this.edges = [];
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
    const maze = createEmptyMaze({ width, height });

    // 2. Инициализировать систему непересекающихся множеств
    this.initializeDisjointSet(width, height);

    // 3. Создать все возможные ребра между соседними клетками
    this.createEdges(width, height);

    // 4. Перемешать ребра случайным образом
    this.shuffleEdges();

    // 5. Основной алгоритм Краскала
    for (const edge of this.edges) {
      // Проверяем, находятся ли клетки в разных компонентах
      if (!this.disjointSet.connected(edge.from, edge.to)) {
        // Объединяем компоненты
        this.disjointSet.union(edge.from, edge.to);

        // Делаем обе клетки проходами
        maze.cells[edge.from.y][edge.from.x].isWall = false;
        maze.cells[edge.to.y][edge.to.x].isWall = false;
        
        // Убираем стену между клетками
        maze.cells[edge.wall.y][edge.wall.x].isWall = false;

        // Визуализация шага
        if (onStep) {
          await onStep({
            type: 'wall_removed',
            position: edge.from,
            connectedPosition: edge.to,
            maze: { ...maze, cells: maze.cells.map(row => [...row]) },
            metadata: {
              componentsCount: this.disjointSet.getComponentCount(),
              edgeWeight: edge.weight,
            },
          });
        }

        // Если все клетки соединены, можно остановиться
        if (this.disjointSet.getComponentCount() === 1) {
          break;
        }
      }
    }

    // 6. Убрать лишнюю стену справа и снизу для четных размеров
    // Для размера 30: последний проход на 27, стена на 28, периметр на 29
    // Нужно убрать стену на 28, чтобы был только периметр на 29
    if (width % 2 === 0) {
      for (let y = 1; y < height - 1; y += 2) {
        // Убираем стену между последним проходом и периметром
        maze.cells[y][width - 2].isWall = false;
      }
    }
    
    if (height % 2 === 0) {
      for (let x = 1; x < width - 1; x += 2) {
        // Убираем стену между последним проходом и периметром
        maze.cells[height - 2][x].isWall = false;
      }
    }

    // 7. Найти вход и выход ПОСЛЕ генерации лабиринта
    const entranceExit = findEntranceAndExit(maze);
    
    if (entranceExit) {
      maze.startPosition = entranceExit.entrance;
      maze.endPosition = entranceExit.exit;
      // Делаем вход и выход проходами
      maze.cells[entranceExit.entrance.y][entranceExit.entrance.x].isWall = false;
      maze.cells[entranceExit.exit.y][entranceExit.exit.x].isWall = false;
    } else {
      console.error('Failed to find entrance and exit');
    }

    // 8. Пометить лабиринт как завершенный
    maze.isComplete = true;
    maze.generationType = 'kruskal';

    return maze;
  }

  /**
   * Инициализировать систему непересекающихся множеств
   */
  private initializeDisjointSet(width: number, height: number): void {
    this.disjointSet.clear();

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        this.disjointSet.makeSet({ x, y });
      }
    }
  }

  /**
   * Создать все возможные ребра между соседними клетками
   * Создаем ребра только для соседей через одну клетку (чтобы между ними была стена)
   * Исключаем периметр - он должен оставаться стенами
   */
  private createEdges(width: number, height: number): void {
    this.edges = [];

    // Начинаем с 1 и заканчиваем на width-2/height-2 чтобы оставить только один ряд периметра
    for (let y = 1; y < height - 1; y += 2) {
      for (let x = 1; x < width - 1; x += 2) {
        const from: Position = { x, y };

        // Ребро вправо (через одну клетку)
        // Разрешаем создавать ребра до width-2 включительно
        if (x + 2 <= width - 2) {
          const to: Position = { x: x + 2, y };
          this.edges.push({
            from,
            to,
            wall: { x: x + 1, y }, // Стена между ними
            weight: Math.random(),
          });
        }

        // Ребро вниз (через одну клетку)
        // Разрешаем создавать ребра до height-2 включительно
        if (y + 2 <= height - 2) {
          const to: Position = { x, y: y + 2 };
          this.edges.push({
            from,
            to,
            wall: { x, y: y + 1 }, // Стена между ними
            weight: Math.random(),
          });
        }
      }
    }
  }

  /**
   * Перемешать ребра случайным образом (алгоритм Фишера-Йейтса)
   */
  private shuffleEdges(): void {
    for (let i = this.edges.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.edges[i], this.edges[j]] = [this.edges[j], this.edges[i]];
    }
  }

  /**
   * Получить статистику генерации
   */
  getStatistics(): {
    totalEdges: number;
    processedEdges: number;
    components: number;
  } {
    return {
      totalEdges: this.edges.length,
      processedEdges: this.edges.length,
      components: this.disjointSet.getComponentCount(),
    };
  }
}