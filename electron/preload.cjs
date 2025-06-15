const { contextBridge, ipcRenderer, webFrame } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // File system operations
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  readFile: (filePath) => ipcRenderer.invoke('fs:readFile', filePath),
  saveFileDialog: (defaultPath) => ipcRenderer.invoke('dialog:saveFile', defaultPath),
  saveFile: (filePath, content) => ipcRenderer.invoke('fs:saveFile', filePath, content),
  saveToDestination: (destinationPath, fileName, content) => ipcRenderer.invoke('fs:saveToDestination', destinationPath, fileName, content),
  
  // Add new search operations
  openDirectoryDialog: () => ipcRenderer.invoke('dialog:openDirectory'),
  searchLicenses: (payload) => ipcRenderer.invoke('search-licenses', payload),
  
  // Expose webFrame zoom functions
  setZoomFactor: (factor) => webFrame.setZoomFactor(factor),
  getZoomFactor: () => webFrame.getZoomFactor(),
  
  // Add drag and drop APIs
  handleDragAndDrop: (callback) => {
    // Listen for file drop events
    document.addEventListener('drop', (event) => {
      event.preventDefault();
      event.stopPropagation();
      
      if (event.dataTransfer) {
        const files = Array.from(event.dataTransfer.files);
        // Basic filtering (example)
        const validFiles = files.filter(file => file.name.endsWith('.lic') || file.name.endsWith('.txt'));
        if (validFiles.length > 0) {
          callback(validFiles); // Pass File objects
        }
      }
    });
    
    // Prevent default behavior for dragover
    document.addEventListener('dragover', (event) => {
      event.preventDefault();
      event.stopPropagation();
    });
  }
});