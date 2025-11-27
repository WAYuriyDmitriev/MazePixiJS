/**
 * Константы приложения
 */

import { Size } from '../types';

/**
 * Размеры лабиринта
 */
export const MIN_MAZE_SIZE = 5;
export const MAX_MAZE_SIZE = 30;
export const DEFAULT_MAZE_SIZE: Size = { width: 15, height: 15 };

/**
 * Размеры клеток
 */
export const MIN_CELL_SIZE = 15;
export const MAX_CELL_SIZE = 50;
export const DEFAULT_CELL_SIZE = 30;

/**
 * Скорость анимации
 */
export const MIN_ANIMATION_SPEED = 0.1;
export const MAX_ANIMATION_SPEED = 5;
export const DEFAULT_ANIMATION_SPEED = 1;

/**
 * Задержки анимации (в миллисекундах)
 */
export const GENERATION_STEP_DELAY = 50;
export const SOLVING_STEP_DELAY = 100;
export const PLAYER_MOVE_DURATION = 200;
export const TRAIL_FADE_DURATION = 300;

/**
 * Система следов
 */
export const MAX_TRAILS = 1000;
export const TRAIL_FADE_SPEED = 0.02;
export const TRAIL_WIDTH = 3;
export const TRAIL_ALPHA = 0.8;

/**
 * Размеры экрана
 */
export const MIN_SCREEN_WIDTH = 800;
export const MIN_SCREEN_HEIGHT = 600;
export const CANVAS_PADDING = 20;

/**
 * UI константы
 */
export const CONTROL_PANEL_HEIGHT = 80;
export const MENU_WIDTH = 400;
export const BUTTON_HEIGHT = 40;
export const SLIDER_WIDTH = 200;

/**
 * Клавиши управления
 */
export const KEYBOARD_CONTROLS = {
  UP: ['ArrowUp', 'w', 'W'],
  DOWN: ['ArrowDown', 's', 'S'],
  LEFT: ['ArrowLeft', 'a', 'A'],
  RIGHT: ['ArrowRight', 'd', 'D'],
  PAUSE: [' ', 'Escape'],
  RESET: ['r', 'R'],
} as const;

/**
 * Цвета по умолчанию (если тема не загружена)
 */
export const DEFAULT_COLORS = {
  WALL: 0x4caf50,
  PATH: 0xe8f5e9,
  PLAYER: 0xff4081,
  TRAIL: 0x8bc34a,
  START: 0xffeb3b,
  END: 0xff5722,
  BACKGROUND: 0xf1f8e9,
  GRID: 0xdcedc8,
} as const;

/**
 * Z-индексы слоев
 */
export const Z_INDEX = {
  BACKGROUND: 0,
  GRID: 1,
  MAZE: 2,
  TRAILS: 3,
  PLAYER: 4,
  UI: 5,
  OVERLAY: 6,
} as const;

/**
 * Производительность
 */
export const PERFORMANCE = {
  TARGET_FPS: 60,
  MIN_FPS: 30,
  BATCH_SIZE: 100,
  VIRTUALIZATION_THRESHOLD: 25, // Размер лабиринта для включения виртуализации
  MAX_PARTICLES: 50,
} as const;

/**
 * Локальное хранилище
 */
export const STORAGE_KEYS = {
  SETTINGS: 'maze_game_settings',
  STATISTICS: 'maze_game_statistics',
  BEST_TIMES: 'maze_game_best_times',
  THEME: 'maze_game_theme',
} as const;

/**
 * Сообщения
 */
export const MESSAGES = {
  GENERATION_COMPLETE: 'Лабиринт создан!',
  MAZE_SOLVED: 'Лабиринт решен!',
  PLAYER_WON: 'Поздравляем! Вы прошли лабиринт!',
  INVALID_MAZE: 'Лабиринт некорректен. Создайте новый.',
  NO_PATH: 'Путь к выходу не найден.',
} as const;

/**
 * Дебаг режим
 */
export const DEBUG = import.meta.env.DEV;

/**
 * Версия приложения
 */
export const APP_VERSION = '1.0.0';