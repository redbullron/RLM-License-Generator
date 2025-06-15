/**
 * Utility functions for file operations using Electron APIs
 */

/**
 * Opens a file dialog and returns the selected file path
 */
export const openFile = async (): Promise<string | null> => {
  if (window.electronAPI) {
    return window.electronAPI.openFile();
  }
  return null;
};

/**
 * Reads content from a file at the specified path
 */
export const readFile = async (filePath: string): Promise<string> => {
  if (window.electronAPI) {
    return window.electronAPI.readFile(filePath);
  }
  throw new Error('Electron API not available');
};

/**
 * Opens a save file dialog and returns the selected file path
 */
export const saveFileDialog = async (defaultPath?: string): Promise<string | null> => {
  if (window.electronAPI) {
    return window.electronAPI.saveFileDialog(defaultPath);
  }
  return null;
};

/**
 * Saves content to a file at the specified path
 */
export const saveFile = async (filePath: string, content: string): Promise<boolean> => {
  if (window.electronAPI) {
    return window.electronAPI.saveFile(filePath, content);
  }
  throw new Error('Electron API not available');
};

/**
 * Sets up a drag and drop handler for files
 */
export const setupDragAndDrop = (callback: (files: File[]) => void): void => {
  if (window.electronAPI) {
    window.electronAPI.handleDragAndDrop(callback);
  }
};