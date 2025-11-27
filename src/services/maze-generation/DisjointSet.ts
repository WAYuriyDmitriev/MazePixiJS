/**
 * Система непересекающихся множеств (Union-Find)
 * Используется в алгоритме Краскала для отслеживания компонент связности
 */

import { Position } from '../../types';

export class DisjointSet {
  private parent: Map<string, string>;
  private rank: Map<string, number>;
  private componentCount: number;

  constructor() {
    this.parent = new Map();
    this.rank = new Map();
    this.componentCount = 0;
  }

  /**
   * Создать новое множество для позиции
   */
  makeSet(position: Position): void {
    const key = this.positionToKey(position);
    if (!this.parent.has(key)) {
      this.parent.set(key, key);
      this.rank.set(key, 0);
      this.componentCount++;
    }
  }

  /**
   * Найти корень множества (с сжатием пути)
   */
  find(position: Position): string {
    const key = this.positionToKey(position);
    
    if (!this.parent.has(key)) {
      this.makeSet(position);
      return key;
    }

    // Сжатие пути для оптимизации
    if (this.parent.get(key) !== key) {
      this.parent.set(key, this.find(this.keyToPosition(this.parent.get(key)!)));
    }

    return this.parent.get(key)!;
  }

  /**
   * Объединить два множества
   */
  union(pos1: Position, pos2: Position): boolean {
    const root1 = this.find(pos1);
    const root2 = this.find(pos2);

    // Уже в одном множестве
    if (root1 === root2) {
      return false;
    }

    // Объединение по рангу
    const rank1 = this.rank.get(root1) || 0;
    const rank2 = this.rank.get(root2) || 0;

    if (rank1 < rank2) {
      this.parent.set(root1, root2);
    } else if (rank1 > rank2) {
      this.parent.set(root2, root1);
    } else {
      this.parent.set(root2, root1);
      this.rank.set(root1, rank1 + 1);
    }

    this.componentCount--;
    return true;
  }

  /**
   * Проверить, находятся ли две позиции в одном множестве
   */
  connected(pos1: Position, pos2: Position): boolean {
    return this.find(pos1) === this.find(pos2);
  }

  /**
   * Получить количество компонент связности
   */
  getComponentCount(): number {
    return this.componentCount;
  }

  /**
   * Сбросить структуру
   */
  clear(): void {
    this.parent.clear();
    this.rank.clear();
    this.componentCount = 0;
  }

  /**
   * Преобразовать позицию в ключ
   */
  private positionToKey(position: Position): string {
    return `${position.x},${position.y}`;
  }

  /**
   * Преобразовать ключ в позицию
   */
  private keyToPosition(key: string): Position {
    const [x, y] = key.split(',').map(Number);
    return { x, y };
  }

  /**
   * Получить размер множества
   */
  getSetSize(position: Position): number {
    const root = this.find(position);
    let size = 0;

    for (const [key, _parent] of this.parent.entries()) {
      if (this.find(this.keyToPosition(key)) === root) {
        size++;
      }
    }

    return size;
  }

  /**
   * Получить все элементы множества
   */
  getSetMembers(position: Position): Position[] {
    const root = this.find(position);
    const members: Position[] = [];

    for (const [key, _parent] of this.parent.entries()) {
      if (this.find(this.keyToPosition(key)) === root) {
        members.push(this.keyToPosition(key));
      }
    }

    return members;
  }
}