interface ElectronAPI {
  openFile: () => Promise<string | null>;
  readFile: (filePath: string) => Promise<string>;
  saveFileDialog: (defaultPath?: string) => Promise<string | null>;
  saveFile: (filePath: string, content: string) => Promise<boolean>;
  saveToDestination: (destinationPath: string, fileName: string, content: string) => Promise<string>;
  handleDragAndDrop: (callback: (files: File[]) => void) => void;
  setZoomFactor: (factor: number) => void;
  getZoomFactor: () => number;
  openDirectoryDialog: () => Promise<string | null>;
  searchLicenses: (payload: { folderPath: string; searchTerm: string }) => Promise<string[]>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};