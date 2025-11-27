/**
 * Хук для генерации лабиринтов
 */

import { useState, useCallback, useRef } from 'react';
import {
  Maze,
  GenerationStep,
  MazeGenerationType,
  Size,
} from '../types';
import {
  KruskalGenerator,
  PrimGenerator,
  ManualGenerator,
} from '../services/maze-generation';
import { GENERATION_STEP_DELAY } from '../utils';

interface UseMazeGeneratorResult {
  maze: Maze | null;
  isGenerating: boolean;
  generationStep: number;
  totalSteps: number;
  generateMaze: (
    type: MazeGenerationType,
    size: Size
  ) => Promise<void>;
  setCustomMaze: (maze: Maze) => void;
  stopGeneration: () => void;
  resetMaze: () => void;
}

export const useMazeGenerator = (): UseMazeGeneratorResult => {
  const [maze, setMaze] = useState<Maze | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  
  const stopGenerationRef = useRef(false);

  /**
   * Генерировать лабиринт
   */
  const generateMaze = useCallback(
    async (
      type: MazeGenerationType,
      size: Size
    ): Promise<void> => {
      const animationSpeed = 1; // Фиксированная скорость
      setIsGenerating(true);
      setGenerationStep(0);
      setTotalSteps(0);
      stopGenerationRef.current = false;

      try {
        let generator;
        let stepCount = 0;

        // Выбираем генератор
        switch (type) {
          case 'kruskal':
            generator = new KruskalGenerator();
            break;
          case 'prim':
            generator = new PrimGenerator();
            break;
          case 'manual':
            generator = new ManualGenerator();
            break;
          default:
            throw new Error(`Unknown generator type: ${type}`);
        }

        // Колбэк для визуализации шагов
        // Для больших лабиринтов обновляем реже для производительности
        const updateInterval = size.width * size.height > 400 ? 5 : 1;
        
        const onStep = async (step: GenerationStep): Promise<void> => {
          if (stopGenerationRef.current) {
            throw new Error('Generation stopped');
          }

          stepCount++;
          setGenerationStep(stepCount);
          
          // Обновляем лабиринт во время генерации
          // Для больших лабиринтов обновляем реже
          if (step.maze && stepCount % updateInterval === 0) {
            setMaze(step.maze);
          }

          // Задержка для анимации (меньше для больших лабиринтов)
          const delay = size.width * size.height > 400
            ? GENERATION_STEP_DELAY / (animationSpeed * 2)
            : GENERATION_STEP_DELAY / animationSpeed;
          await new Promise((resolve) => setTimeout(resolve, delay));
        };

        // Генерируем лабиринт
        const generatedMaze = await generator.generate(
          size.width,
          size.height,
          type === 'manual' ? undefined : onStep
        );

        if (!stopGenerationRef.current) {
          setMaze(generatedMaze);
          setTotalSteps(stepCount);
        }
      } catch (error) {
        if (error instanceof Error && error.message !== 'Generation stopped') {
          console.error('Maze generation error:', error);
        }
      } finally {
        setIsGenerating(false);
      }
    },
    []
  );

  /**
   * Остановить генерацию
   */
  const stopGeneration = useCallback(() => {
    stopGenerationRef.current = true;
    setIsGenerating(false);
  }, []);

  /**
   * Установить готовый лабиринт (из редактора)
   */
  const setCustomMaze = useCallback((customMaze: Maze) => {
    setMaze(customMaze);
    setGenerationStep(0);
    setTotalSteps(0);
  }, []);

  /**
   * Сбросить лабиринт
   */
  const resetMaze = useCallback(() => {
    setMaze(null);
    setGenerationStep(0);
    setTotalSteps(0);
  }, []);

  return {
    maze,
    isGenerating,
    generationStep,
    totalSteps,
    generateMaze,
    setCustomMaze,
    stopGeneration,
    resetMaze,
  };
};