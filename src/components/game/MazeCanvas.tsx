/**
 * Canvas компонент для отрисовки лабиринта с @pixi/react
 */

import React, { useMemo, useCallback, memo } from 'react';
import { Stage, Container, Graphics } from '@pixi/react';
import { Maze, Theme, Player, Trail, Position } from '../../types';
import { calculateCellSize } from '../../utils';
import styles from './MazeCanvas.module.css';

// Конвертация hex в строку для PixiJS v8
const hexToString = (hex: number): string => `#${hex.toString(16).padStart(6, '0')}`;

interface MazeCanvasProps {
  maze: Maze;
  theme: Theme;
  player?: Player;
  trails?: Trail[];
  solution?: Position[];
  width?: number;
  height?: number;
}

export const MazeCanvas: React.FC<MazeCanvasProps> = memo(({
  maze,
  theme,
  player,
  trails = [],
  solution = [],
  width = 800,
  height = 600,
}) => {
  const cellSize = useMemo(
    () => calculateCellSize(maze.size, width, height),
    [maze.size, width, height]
  );

  // Вычисляем смещение для центрирования
  const offset = useMemo(() => {
    const mazeWidth = maze.size.width * cellSize;
    const mazeHeight = maze.size.height * cellSize;
    return {
      x: (width - mazeWidth) / 2,
      y: (height - mazeHeight) / 2,
    };
  }, [maze.size, cellSize, width, height]);

  // Отрисовка лабиринта
  const drawMaze = useCallback(
    (g: any) => {
      g.clear();

      // Рисуем заливку клеток
      for (let y = 0; y < maze.size.height; y++) {
        for (let x = 0; x < maze.size.width; x++) {
          const cell = maze.cells[y][x];
          
          // Определяем цвет
          let color = theme.colors.path;
          if (cell.isWall) {
            color = theme.colors.wall;
          } else if (maze.startPosition && x === maze.startPosition.x && y === maze.startPosition.y) {
            color = theme.colors.start;
          } else if (maze.endPosition && x === maze.endPosition.x && y === maze.endPosition.y) {
            color = theme.colors.end;
          }

          // Рисуем клетку с учетом смещения
          const drawX = x * cellSize + offset.x;
          const drawY = y * cellSize + offset.y;
          
          g.beginFill(hexToString(color));
          g.drawRect(drawX, drawY, cellSize, cellSize);
          g.endFill();
        }
      }

      // Рисуем сетку поверх (один раз для всего лабиринта)
      // Показываем сетку только для средних и больших клеток
      if (cellSize >= 15) {
        g.lineStyle(1, hexToString(theme.colors.grid || 0xcccccc), 0.15);
        
        // Вертикальные линии (не включая последнюю)
        for (let x = 1; x < maze.size.width; x++) {
          const drawX = x * cellSize + offset.x;
          g.moveTo(drawX, offset.y);
          g.lineTo(drawX, maze.size.height * cellSize + offset.y);
        }
        
        // Горизонтальные линии (не включая последнюю)
        for (let y = 1; y < maze.size.height; y++) {
          const drawY = y * cellSize + offset.y;
          g.moveTo(offset.x, drawY);
          g.lineTo(maze.size.width * cellSize + offset.x, drawY);
        }
      }
    },
    [maze, theme, cellSize, offset]
  );

  // Отрисовка следов
  const drawTrails = useCallback(
    (g: any) => {
      g.clear();

      trails.forEach((trail) => {
        const fromX = trail.from.x * cellSize + cellSize / 2 + offset.x;
        const fromY = trail.from.y * cellSize + cellSize / 2 + offset.y;
        const toX = trail.to.x * cellSize + cellSize / 2 + offset.x;
        const toY = trail.to.y * cellSize + cellSize / 2 + offset.y;

        g.lineStyle(3, hexToString(trail.color), trail.alpha);
        g.moveTo(fromX, fromY);
        g.lineTo(toX, toY);
      });
    },
    [trails, cellSize, offset]
  );

  // Отрисовка решения (путь алгоритма)
  const drawSolution = useCallback(
    (g: any) => {
      g.clear();

      if (solution.length > 1) {
        g.lineStyle(4, hexToString(0xffeb3b), 0.7);
        for (let i = 0; i < solution.length - 1; i++) {
          const from = solution[i];
          const to = solution[i + 1];

          const fromX = from.x * cellSize + cellSize / 2 + offset.x;
          const fromY = from.y * cellSize + cellSize / 2 + offset.y;
          const toX = to.x * cellSize + cellSize / 2 + offset.x;
          const toY = to.y * cellSize + cellSize / 2 + offset.y;

          g.moveTo(fromX, fromY);
          g.lineTo(toX, toY);
        }
      }
    },
    [solution, cellSize, offset]
  );

  // Отрисовка игрока
  const drawPlayer = useCallback(
    (g: any) => {
      g.clear();

      if (player) {
        const centerX = player.position.x * cellSize + cellSize / 2 + offset.x;
        const centerY = player.position.y * cellSize + cellSize / 2 + offset.y;
        const radius = cellSize * 0.3;

        g.beginFill(hexToString(theme.colors.player));
        g.drawCircle(centerX, centerY, radius);
        g.endFill();
      }
    },
    [player, theme, cellSize, offset]
  );

  return (
    <div className={styles.container}>
      <Stage
        width={width}
        height={height}
        options={{
          background: hexToString(theme.colors.background),
          antialias: true,
          autoDensity: true,
          resolution: window.devicePixelRatio || 1
        }}
      >
        <Container>
          <Graphics draw={drawMaze} />
          <Graphics draw={drawTrails} />
          <Graphics draw={drawSolution} />
          <Graphics draw={drawPlayer} />
        </Container>
      </Stage>
    </div>
  );
}, (prevProps, nextProps) => {
  // Оптимизация: перерисовываем только при реальных изменениях
  const prevSolutionLength = (prevProps.solution || []).length;
  const nextSolutionLength = (nextProps.solution || []).length;
  const prevTrailsLength = (prevProps.trails || []).length;
  const nextTrailsLength = (nextProps.trails || []).length;
  
  // Для solution проверяем не только длину, но и последнюю позицию
  const solutionChanged = prevSolutionLength !== nextSolutionLength ||
    (nextSolutionLength > 0 && prevSolutionLength > 0 &&
      (prevProps.solution![prevSolutionLength - 1].x !== nextProps.solution![nextSolutionLength - 1].x ||
       prevProps.solution![prevSolutionLength - 1].y !== nextProps.solution![nextSolutionLength - 1].y));
  
  return (
    prevProps.maze === nextProps.maze &&
    prevProps.player?.position.x === nextProps.player?.position.x &&
    prevProps.player?.position.y === nextProps.player?.position.y &&
    prevTrailsLength === nextTrailsLength &&
    !solutionChanged &&
    prevProps.theme.name === nextProps.theme.name
  );
});

MazeCanvas.displayName = 'MazeCanvas';