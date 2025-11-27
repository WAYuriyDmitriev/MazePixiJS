/**
 * Хук для обработки клавиатурных событий
 */

import { useEffect, useCallback, useRef, useState } from 'react';
import { Direction } from '../types';
import { KEYBOARD_CONTROLS } from '../utils';

interface UseKeyboardOptions {
  onArrowKey?: (direction: Direction) => void;
  onPause?: () => void;
  onReset?: () => void;
  enabled?: boolean;
}

export const useKeyboard = ({
  onArrowKey,
  onPause,
  onReset,
  enabled = true,
}: UseKeyboardOptions): void => {
  const handlersRef = useRef({ onArrowKey, onPause, onReset });

  // Обновляем ссылки на обработчики
  useEffect(() => {
    handlersRef.current = { onArrowKey, onPause, onReset };
  }, [onArrowKey, onPause, onReset]);

  /**
   * Обработчик нажатия клавиш
   */
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      const key = event.key;

      // Проверяем стрелки вверх
      if (KEYBOARD_CONTROLS.UP.includes(key as any)) {
        event.preventDefault();
        handlersRef.current.onArrowKey?.('up');
        return;
      }

      // Проверяем стрелки вниз
      if (KEYBOARD_CONTROLS.DOWN.includes(key as any)) {
        event.preventDefault();
        handlersRef.current.onArrowKey?.('down');
        return;
      }

      // Проверяем стрелки влево
      if (KEYBOARD_CONTROLS.LEFT.includes(key as any)) {
        event.preventDefault();
        handlersRef.current.onArrowKey?.('left');
        return;
      }

      // Проверяем стрелки вправо
      if (KEYBOARD_CONTROLS.RIGHT.includes(key as any)) {
        event.preventDefault();
        handlersRef.current.onArrowKey?.('right');
        return;
      }

      // Проверяем паузу
      if (KEYBOARD_CONTROLS.PAUSE.includes(key as any)) {
        event.preventDefault();
        handlersRef.current.onPause?.();
        return;
      }

      // Проверяем сброс
      if (KEYBOARD_CONTROLS.RESET.includes(key as any)) {
        event.preventDefault();
        handlersRef.current.onReset?.();
        return;
      }
    },
    [enabled]
  );

  /**
   * Подписываемся на события клавиатуры
   */
  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, handleKeyDown]);
};

/**
 * Хук для отслеживания нажатых клавиш
 */
export const useKeyPress = (targetKey: string): boolean => {
  const [keyPressed, setKeyPressed] = useState(false);

  useEffect(() => {
    const downHandler = (event: KeyboardEvent) => {
      if (event.key === targetKey) {
        setKeyPressed(true);
      }
    };

    const upHandler = (event: KeyboardEvent) => {
      if (event.key === targetKey) {
        setKeyPressed(false);
      }
    };

    window.addEventListener('keydown', downHandler);
    window.addEventListener('keyup', upHandler);

    return () => {
      window.removeEventListener('keydown', downHandler);
      window.removeEventListener('keyup', upHandler);
    };
  }, [targetKey]);

  return keyPressed;
};

/**
 * Хук для отслеживания комбинаций клавиш
 */
export const useKeyCombo = (
  keys: string[],
  callback: () => void,
  enabled: boolean = true
): void => {
  const pressedKeys = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!enabled) return;

    const downHandler = (event: KeyboardEvent) => {
      pressedKeys.current.add(event.key);

      // Проверяем, нажаты ли все клавиши комбинации
      const allPressed = keys.every((key) => pressedKeys.current.has(key));

      if (allPressed) {
        event.preventDefault();
        callback();
      }
    };

    const upHandler = (event: KeyboardEvent) => {
      pressedKeys.current.delete(event.key);
    };

    window.addEventListener('keydown', downHandler);
    window.addEventListener('keyup', upHandler);

    return () => {
      window.removeEventListener('keydown', downHandler);
      window.removeEventListener('keyup', upHandler);
      pressedKeys.current.clear();
    };
  }, [keys, callback, enabled]);
};