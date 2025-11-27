/**
 * Типы данных для тем оформления
 */

/**
 * Название темы
 */
export type ThemeName = 'spring' | 'summer' | 'autumn' | 'winter';

/**
 * Цветовая палитра темы
 */
export interface ThemeColors {
  wall: number;
  path: number;
  player: number;
  trail: number;
  trailGradient: number[];
  start: number;
  end: number;
  background: number;
  visited: number;
  current: number;
  grid?: number;
}

/**
 * Текстуры темы (опционально)
 */
export interface ThemeTextures {
  wall?: string;
  path?: string;
  player?: string;
  background?: string;
}

/**
 * Настройки частиц темы
 */
export interface ThemeParticles {
  enabled: boolean;
  count: number;
  texture: string;
  speed: number;
  size: number;
}

/**
 * Тема оформления
 */
export interface Theme {
  name: ThemeName;
  displayName: string;
  description: string;
  colors: ThemeColors;
  textures?: ThemeTextures;
  particles?: ThemeParticles;
}

/**
 * Весенняя тема
 */
export const SPRING_THEME: Theme = {
  name: 'spring',
  displayName: 'Весна',
  description: 'Зеленые пастельные тона с цветочными мотивами',
  colors: {
    wall: 0x4caf50, // Зеленый
    path: 0xe8f5e9, // Светло-зеленый
    player: 0xff4081, // Розовый
    trail: 0x8bc34a, // Светло-зеленый
    trailGradient: [0x4caf50, 0x8bc34a, 0xcddc39],
    start: 0xffeb3b, // Желтый
    end: 0xff5722, // Оранжевый
    background: 0xf1f8e9, // Очень светло-зеленый
    visited: 0xc8e6c9, // Светло-зеленый (посещенные клетки)
    current: 0x66bb6a, // Средне-зеленый (текущая клетка)
    grid: 0xdcedc8, // Линии сетки
  },
};

/**
 * Летняя тема
 */
export const SUMMER_THEME: Theme = {
  name: 'summer',
  displayName: 'Лето',
  description: 'Яркие теплые цвета солнечного дня',
  colors: {
    wall: 0xff9800, // Оранжевый
    path: 0xfff3e0, // Светло-оранжевый
    player: 0x2196f3, // Синий
    trail: 0xffb74d, // Светло-оранжевый
    trailGradient: [0xff9800, 0xffc107, 0xffeb3b],
    start: 0xffeb3b, // Желтый
    end: 0xf44336, // Красный
    background: 0xfffde7, // Очень светло-желтый
    visited: 0xffe0b2, // Светло-оранжевый
    current: 0xffa726, // Средне-оранжевый
    grid: 0xffecb3, // Линии сетки
  },
};

/**
 * Осенняя тема
 */
export const AUTUMN_THEME: Theme = {
  name: 'autumn',
  displayName: 'Осень',
  description: 'Красно-коричневые оттенки осенней листвы',
  colors: {
    wall: 0x795548, // Коричневый
    path: 0xefebe9, // Светло-коричневый
    player: 0xff5722, // Оранжево-красный
    trail: 0xff8a65, // Светло-оранжевый
    trailGradient: [0x795548, 0xff8a65, 0xffab91],
    start: 0xffeb3b, // Желтый
    end: 0x4caf50, // Зеленый
    background: 0xfbe9e7, // Очень светло-коричневый
    visited: 0xd7ccc8, // Светло-коричневый
    current: 0xa1887f, // Средне-коричневый
    grid: 0xe0e0e0, // Линии сетки
  },
};

/**
 * Зимняя тема
 */
export const WINTER_THEME: Theme = {
  name: 'winter',
  displayName: 'Зима',
  description: 'Холодные синие тона зимнего дня',
  colors: {
    wall: 0x2196f3, // Синий
    path: 0xe3f2fd, // Светло-синий
    player: 0xff4081, // Розовый
    trail: 0x64b5f6, // Светло-синий
    trailGradient: [0x2196f3, 0x64b5f6, 0x90caf9],
    start: 0xffeb3b, // Желтый
    end: 0x4caf50, // Зеленый
    background: 0xe1f5fe, // Очень светло-синий
    visited: 0xbbdefb, // Светло-синий
    current: 0x42a5f5, // Средне-синий
    grid: 0xb3e5fc, // Линии сетки
  },
};

/**
 * Все доступные темы
 */
export const THEMES: Record<ThemeName, Theme> = {
  spring: SPRING_THEME,
  summer: SUMMER_THEME,
  autumn: AUTUMN_THEME,
  winter: WINTER_THEME,
};

/**
 * Получить тему по имени
 */
export const getTheme = (name: ThemeName): Theme => {
  return THEMES[name];
};

/**
 * Получить список всех тем
 */
export const getAllThemes = (): Theme[] => {
  return Object.values(THEMES);
};

/**
 * Получить имена всех тем
 */
export const getThemeNames = (): ThemeName[] => {
  return Object.keys(THEMES) as ThemeName[];
};