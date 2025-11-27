import { useState, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Stage, Container, Graphics } from '@pixi/react';
import { Maze, Size, ThemeName, getTheme, createEmptyMaze } from '../types';
import { EditorTool } from '../types/editor';
import { validateMaze } from '../utils/maze-validation';
import { calculateCellSize } from '../utils';
import styles from './EditorPage.module.css';

const hexToString = (hex: number): string => `#${hex.toString(16).padStart(6, '0')}`;

export const EditorPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { size, theme: themeName } = location.state as {
    size: Size;
    theme: ThemeName;
  } || { size: { width: 15, height: 15 }, theme: 'spring' as ThemeName };

  const theme = getTheme(themeName);
  const [maze, setMaze] = useState<Maze>(() => {
    const emptyMaze = createEmptyMaze(size);
    // Делаем все клетки проходами (кроме периметра)
    for (let y = 0; y < size.height; y++) {
      for (let x = 0; x < size.width; x++) {
        const isPerimeter = x === 0 || x === size.width - 1 || y === 0 || y === size.height - 1;
        if (!isPerimeter) {
          emptyMaze.cells[y][x].isWall = false;
        }
      }
    }
    // Убираем начальные вход и выход - пользователь должен их поставить сам
    emptyMaze.startPosition = undefined;
    emptyMaze.endPosition = undefined;
    return emptyMaze;
  });
  const [tool, setTool] = useState<EditorTool>('wall');
  const [errors, setErrors] = useState<string[]>([]);

  const cellSize = useMemo(() => calculateCellSize(size, 800, 600), [size]);
  
  const offset = useMemo(() => {
    const mazeWidth = size.width * cellSize;
    const mazeHeight = size.height * cellSize;
    return { x: (800 - mazeWidth) / 2, y: (600 - mazeHeight) / 2 };
  }, [size, cellSize]);

  const handleCellClick = useCallback((x: number, y: number) => {
    setMaze(prev => {
      const newMaze = { ...prev, cells: prev.cells.map(row => [...row]) };
      
      if (tool === 'entrance') {
        if (prev.startPosition) {
          newMaze.cells[prev.startPosition.y][prev.startPosition.x].isWall = true;
        }
        newMaze.startPosition = { x, y };
        newMaze.cells[y][x].isWall = false;
      } else if (tool === 'exit') {
        if (prev.endPosition) {
          newMaze.cells[prev.endPosition.y][prev.endPosition.x].isWall = true;
        }
        newMaze.endPosition = { x, y };
        newMaze.cells[y][x].isWall = false;
      } else if (tool === 'wall') {
        if ((prev.startPosition && x === prev.startPosition.x && y === prev.startPosition.y) ||
            (prev.endPosition && x === prev.endPosition.x && y === prev.endPosition.y)) {
          return prev;
        }
        newMaze.cells[y][x].isWall = true;
      } else if (tool === 'path') {
        newMaze.cells[y][x].isWall = false;
      }
      
      return newMaze;
    });
    setErrors([]);
  }, [tool]);

  const drawMaze = useCallback((g: any) => {
    g.clear();
    for (let y = 0; y < size.height; y++) {
      for (let x = 0; x < size.width; x++) {
        const cell = maze.cells[y][x];
        let color = cell.isWall ? theme.colors.wall : theme.colors.path;
        
        if (maze.startPosition && x === maze.startPosition.x && y === maze.startPosition.y) {
          color = theme.colors.start;
        }
        if (maze.endPosition && x === maze.endPosition.x && y === maze.endPosition.y) {
          color = theme.colors.end;
        }

        const drawX = x * cellSize + offset.x;
        const drawY = y * cellSize + offset.y;
        
        g.beginFill(hexToString(color));
        g.drawRect(drawX, drawY, cellSize, cellSize);
        g.endFill();
        
        g.lineStyle(1, hexToString(theme.colors.grid || 0xcccccc), 0.3);
        g.drawRect(drawX, drawY, cellSize, cellSize);
      }
    }
  }, [maze, theme, cellSize, offset, size]);

  const handleValidate = () => {
    const result = validateMaze(maze);
    setErrors(result.errors);
    
    if (result.isValid) {
      navigate('/game', { state: { size, generation: 'manual', theme: themeName, customMaze: maze } });
    }
  };

  const handleCanvasClick = (event: any) => {
    const rect = event.target.getBoundingClientRect();
    const clickX = event.clientX - rect.left - offset.x;
    const clickY = event.clientY - rect.top - offset.y;
    
    const cellX = Math.floor(clickX / cellSize);
    const cellY = Math.floor(clickY / cellSize);
    
    if (cellX >= 0 && cellX < size.width && cellY >= 0 && cellY < size.height) {
      handleCellClick(cellX, cellY);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Редактор лабиринта</h1>
        <button onClick={() => navigate('/')} className={styles.backButton}>← Назад</button>
      </header>

      <div className={styles.content}>
        <div className={styles.toolbar}>
          <h3>Инструменты</h3>
          <button className={tool === 'path' ? styles.active : ''} onClick={() => setTool('path')}>
            🟩 Проход
          </button>
          <button className={tool === 'wall' ? styles.active : ''} onClick={() => setTool('wall')}>
            ⬛ Стена
          </button>
          <button className={tool === 'entrance' ? styles.active : ''} onClick={() => setTool('entrance')}>
            🟨 Вход
          </button>
          <button className={tool === 'exit' ? styles.active : ''} onClick={() => setTool('exit')}>
            🟧 Выход
          </button>
          
          <div className={styles.actions}>
            <button onClick={handleValidate} className={styles.validateButton}>
              ✓ Проверить и начать
            </button>
          </div>

          {errors.length > 0 && (
            <div className={styles.errors}>
              <h4>Ошибки:</h4>
              {errors.map((err, i) => <p key={i}>• {err}</p>)}
            </div>
          )}
        </div>

        <div className={styles.canvas} onClick={handleCanvasClick}>
          <Stage width={800} height={600} options={{ background: hexToString(theme.colors.background) }}>
            <Container>
              <Graphics draw={drawMaze} />
            </Container>
          </Stage>
        </div>
      </div>
    </div>
  );
};