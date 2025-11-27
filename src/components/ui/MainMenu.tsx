/**
 * Главное меню игры
 */

import React, { useState } from 'react';
import {
  Size,
  MazeGenerationType,
  ThemeName,
  getAllThemes,
  GENERATION_ALGORITHMS,
} from '../../types';
import { MIN_MAZE_SIZE, MAX_MAZE_SIZE, DEFAULT_MAZE_SIZE } from '../../utils';
import styles from './MainMenu.module.css';

interface MainMenuProps {
  onStartGame: (
    size: Size,
    generationType: MazeGenerationType,
    theme: ThemeName
  ) => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onStartGame }) => {
  const [width, setWidth] = useState(DEFAULT_MAZE_SIZE.width);
  const [height, setHeight] = useState(DEFAULT_MAZE_SIZE.height);
  const [generationType, setGenerationType] =
    useState<MazeGenerationType>('kruskal');
  const [theme, setTheme] = useState<ThemeName>('spring');

  const themes = getAllThemes();

  const handleStart = () => {
    onStartGame({ width, height }, generationType, theme);
  };

  return (
    <div className={styles.container}>
      <div className={styles.menu}>

        {/* Размер лабиринта */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Размер лабиринта</h2>
          
          <div className={styles.sizeControls}>
            <div className={styles.inputGroup}>
              <label htmlFor="width">Ширина:</label>
              <input
                id="width"
                type="number"
                min={MIN_MAZE_SIZE}
                max={MAX_MAZE_SIZE}
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
                className={styles.input}
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="height">Высота:</label>
              <input
                id="height"
                type="number"
                min={MIN_MAZE_SIZE}
                max={MAX_MAZE_SIZE}
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.presets}>
            <button onClick={() => { setWidth(10); setHeight(10); }}>
              10×10
            </button>
            <button onClick={() => { setWidth(15); setHeight(15); }}>
              15×15
            </button>
            <button onClick={() => { setWidth(20); setHeight(20); }}>
              20×20
            </button>
            <button onClick={() => { setWidth(30); setHeight(30); }}>
              30×30
            </button>
          </div>
        </div>

        {/* Алгоритм генерации */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Алгоритм генерации</h2>
          
          <div className={styles.radioGroup}>
            {Object.values(GENERATION_ALGORITHMS).map((algo) => (
              <label key={algo.name} className={styles.radioLabel}>
                <input
                  type="radio"
                  name="generation"
                  value={algo.name}
                  checked={generationType === algo.name}
                  onChange={() => setGenerationType(algo.name)}
                  className={styles.radio}
                />
                <div className={styles.radioContent}>
                  <span className={styles.radioTitle}>{algo.displayName}</span>
                  <span className={styles.radioDescription}>
                    {algo.description}
                  </span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Тема оформления */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Тема оформления</h2>
          
          <div className={styles.themeGrid}>
            {themes.map((t) => (
              <button
                key={t.name}
                onClick={() => setTheme(t.name)}
                className={`${styles.themeCard} ${
                  theme === t.name ? styles.themeCardActive : ''
                }`}
                style={{
                  borderColor: `#${t.colors.wall.toString(16).padStart(6, '0')}`,
                }}
              >
                <div
                  className={styles.themePreview}
                  style={{
                    background: `linear-gradient(135deg, 
                      #${t.colors.wall.toString(16).padStart(6, '0')}, 
                      #${t.colors.path.toString(16).padStart(6, '0')})`,
                  }}
                />
                <span className={styles.themeName}>{t.displayName}</span>
                <span className={styles.themeDescription}>{t.description}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Кнопка старта */}
        <button onClick={handleStart} className={styles.startButton}>
          🚀 Начать игру
        </button>

        {/* Информация */}
        <div className={styles.info}>
          <p>
            <strong>Управление:</strong> Стрелки или WASD для движения
          </p>
          <p>
            <strong>Пауза:</strong> Space или Escape
          </p>
          <p>
            <strong>Сброс:</strong> R
          </p>
        </div>
      </div>
    </div>
  );
};