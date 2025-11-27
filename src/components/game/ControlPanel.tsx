import React from 'react';
import type { GameScreen, AlgorithmName } from '../../types';
import styles from './ControlPanel.module.css';

interface ControlPanelProps {
  gameState: GameScreen;
  isPaused: boolean;
  solvingAlgorithm: AlgorithmName | null;
  generationStep: number;
  solvingStep: number;
  movesCount: number;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onStartSolving: (algorithm: AlgorithmName) => void;
  onStopSolving: () => void;
  onBackToMenu: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  gameState,
  isPaused,
  solvingAlgorithm,
  generationStep,
  solvingStep,
  movesCount,
  onPause,
  onResume,
  onReset,
  onStartSolving,
  onStopSolving,
  onBackToMenu,
}) => {
  const isGenerating = gameState === 'generation';
  const isPlaying = gameState === 'playing';
  const isSolving = gameState === 'solving';
  const isCompleted = gameState === 'completed';

  return (
    <div className={styles.controlPanel}>
      {/* Статус игры */}
      <div className={styles.statusSection}>
        <h3 className={styles.sectionTitle}>Статус</h3>
        <div className={styles.statusInfo}>
          <div className={styles.statusItem}>
            <span className={styles.statusLabel}>Состояние:</span>
            <span className={styles.statusValue}>
              {isGenerating && 'Генерация лабиринта...'}
              {isPlaying && 'Игра'}
              {isSolving && 'Автоматическое решение...'}
              {isCompleted && '🎉 Лабиринт пройден!'}
            </span>
          </div>

          {isGenerating && (
            <div className={styles.statusItem}>
              <span className={styles.statusLabel}>Шаг генерации:</span>
              <span className={styles.statusValue}>{generationStep}</span>
            </div>
          )}

          {isSolving && (
            <div className={styles.statusItem}>
              <span className={styles.statusLabel}>Шаг решения:</span>
              <span className={styles.statusValue}>{solvingStep}</span>
            </div>
          )}

          {(isPlaying || isSolving || isCompleted) && (
            <div className={styles.statusItem}>
              <span className={styles.statusLabel}>Количество ходов:</span>
              <span className={styles.statusValue}>{movesCount}</span>
            </div>
          )}
        </div>
      </div>

      {/* Кнопки управления */}
      <div className={styles.controlsSection}>
        <h3 className={styles.sectionTitle}>Управление</h3>
        <div className={styles.buttonGroup}>
          {/* Пауза/Продолжить */}
          {(isGenerating || isSolving) && (
            <button
              onClick={isPaused ? onResume : onPause}
              className={`${styles.button} ${styles.buttonPrimary}`}
            >
              {isPaused ? '▶️ Продолжить' : '⏸️ Пауза'}
            </button>
          )}

          {/* Сброс */}
          {(isPlaying || isCompleted) && (
            <button
              onClick={onReset}
              className={`${styles.button} ${styles.buttonSecondary}`}
            >
              🔄 Сброс
            </button>
          )}

          {/* Вернуться в меню */}
          <button
            onClick={onBackToMenu}
            className={`${styles.button} ${styles.buttonSecondary}`}
          >
            🏠 В меню
          </button>
        </div>
      </div>

      {/* Автоматическое решение */}
      {isPlaying && !solvingAlgorithm && (
        <div className={styles.solvingSection}>
          <h3 className={styles.sectionTitle}>Автоматическое решение</h3>
          <div className={styles.buttonGroup}>
            <button
              onClick={() => onStartSolving('rightHand')}
              className={`${styles.button} ${styles.buttonSolve}`}
            >
              🤚 Алгоритм правой руки
            </button>
            <button
              onClick={() => onStartSolving('wave')}
              className={`${styles.button} ${styles.buttonSolve}`}
            >
              🌊 Волновой алгоритм
            </button>
          </div>
        </div>
      )}

      {/* Остановить решение */}
      {isSolving && (
        <div className={styles.solvingSection}>
          <h3 className={styles.sectionTitle}>Решение</h3>
          <div className={styles.buttonGroup}>
            <button
              onClick={onStopSolving}
              className={`${styles.button} ${styles.buttonDanger}`}
            >
              ⏹️ Остановить решение
            </button>
          </div>
        </div>
      )}

      {/* Подсказки по управлению */}
      {isPlaying && (
        <div className={styles.hintsSection}>
          <h3 className={styles.sectionTitle}>Управление</h3>
          <div className={styles.hints}>
            <div className={styles.hint}>
              <span className={styles.hintKey}>↑ ↓ ← →</span>
              <span className={styles.hintText}>Движение</span>
            </div>
            <div className={styles.hint}>
              <span className={styles.hintKey}>W A S D</span>
              <span className={styles.hintText}>Альтернативное управление</span>
            </div>
            <div className={styles.hint}>
              <span className={styles.hintKey}>Space</span>
              <span className={styles.hintText}>Пауза</span>
            </div>
            <div className={styles.hint}>
              <span className={styles.hintKey}>R</span>
              <span className={styles.hintText}>Сброс</span>
            </div>
          </div>
        </div>
      )}

      {/* Сообщение о победе */}
      {isCompleted && (
        <div className={styles.victorySection}>
          <div className={styles.victoryMessage}>
            <h2 className={styles.victoryTitle}>🎉 Поздравляем!</h2>
            <p className={styles.victoryText}>
              Вы прошли лабиринт за {movesCount} ходов!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};