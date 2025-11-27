import { useNavigate } from 'react-router-dom';
import { MainMenu } from '../components/ui';
import { MazeGenerationType, ThemeName, Size } from '../types';
import styles from './MenuPage.module.css';

export const MenuPage = () => {
  const navigate = useNavigate();

  const handleStartGame = (
    size: Size,
    generation: MazeGenerationType,
    theme: ThemeName
  ) => {
    // Если выбран ручной режим, переходим на редактор
    if (generation === 'manual') {
      navigate('/editor', {
        state: {
          size,
          theme,
        },
      });
    } else {
      // Иначе сразу на игру
      navigate('/game', {
        state: {
          size,
          generation,
          theme,
        },
      });
    }
  };

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>
          <span className={styles.icon}>🎮</span>
          Maze Game
        </h1>
        <p className={styles.subtitle}>
          Генерация и прохождение лабиринтов
        </p>
        <MainMenu onStartGame={handleStartGame} />
      </main>
    </div>
  );
};