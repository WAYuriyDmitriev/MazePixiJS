/**
 * Типы для редактора лабиринтов
 */

export type EditorTool = 'wall' | 'path' | 'entrance' | 'exit';

export interface EditorState {
  tool: EditorTool;
  hasEntrance: boolean;
  hasExit: boolean;
  isValid: boolean;
  validationErrors: string[];
}