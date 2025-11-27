/**
 * Хук для решения лабиринтов
 */

import { useState, useCallback, useRef } from 'react';
import {
  Maze,
  Position,
  SolvingStep,
  AlgorithmName,
} from '../types';
import {
  RightHandSolver,
  WaveAlgorithmSolver,
} from '../services/maze-solving';
import { SOLVING_STEP_DELAY } from '../utils';

interface UseMazeSolverResult {
  solution: Position[];
  isSolving: boolean;
  solvingStep: number;
  totalSteps: number;
  solveMaze: (
    algorithm: AlgorithmName
  ) => Promise<void>;
  stopSolving: () => void;
  resetSolution: () => void;
}

export const useMazeSolver = (
  maze: Maze | null
): UseMazeSolverResult => {
  const [solution, setSolution] = useState<Position[]>([]);
  const [isSolving, setIsSolving] = useState(false);
  const [solvingStep, setSolvingStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);

  const stopSolvingRef = useRef(false);

  /**
   * Решить лабиринт
   */
  const solveMaze = useCallback(
    async (
      algorithm: AlgorithmName
    ): Promise<void> => {
      const animationSpeed = 1; // Фиксированная скорость
      if (!maze || algorithm === 'manual' || !maze.startPosition || !maze.endPosition) return;

      setIsSolving(true);
      setSolvingStep(0);
      setTotalSteps(0);
      stopSolvingRef.current = false;

      try {
        let solver;
        let stepCount = 0;

        // Выбираем решатель
        switch (algorithm) {
          case 'rightHand':
            solver = new RightHandSolver();
            break;
          case 'wave':
            solver = new WaveAlgorithmSolver();
            break;
          default:
            throw new Error(`Unknown solver algorithm: ${algorithm}`);
        }

        // Батчинг для больших лабиринтов
        const mazeSize = maze.size.width * maze.size.height;
        const updateInterval = mazeSize > 400 ? 3 : 1;

        // Колбэк для визуализации шагов
        const onStep = async (step: SolvingStep): Promise<void> => {
          if (stopSolvingRef.current) {
            throw new Error('Solving stopped');
          }

          stepCount++;
          setSolvingStep(stepCount);
          
          // Обновляем путь для визуализации (с батчингом)
          if (step.path && stepCount % updateInterval === 0) {
            setSolution(step.path);
          }

          // Задержка для анимации (меньше для больших лабиринтов)
          const delay = mazeSize > 400
            ? SOLVING_STEP_DELAY / (animationSpeed * 2)
            : SOLVING_STEP_DELAY / animationSpeed;
          await new Promise((resolve) => setTimeout(resolve, delay));
        };

        // Решаем лабиринт
        const path = await solver.solve(
          maze,
          maze.startPosition,
          maze.endPosition,
          onStep
        );

        if (!stopSolvingRef.current) {
          setSolution(path);
          setTotalSteps(stepCount);
        }
      } catch (error) {
        if (error instanceof Error && error.message !== 'Solving stopped') {
          console.error('Maze solving error:', error);
        }
      } finally {
        setIsSolving(false);
      }
    },
    [maze]
  );

  /**
   * Остановить решение
   */
  const stopSolving = useCallback(() => {
    stopSolvingRef.current = true;
    setIsSolving(false);
  }, []);

  /**
   * Сбросить решение
   */
  const resetSolution = useCallback(() => {
    setSolution([]);
    setSolvingStep(0);
    setTotalSteps(0);
  }, []);

  return {
    solution,
    isSolving,
    solvingStep,
    totalSteps,
    solveMaze,
    stopSolving,
    resetSolution,
  };
};