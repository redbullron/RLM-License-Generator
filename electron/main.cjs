const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

// Handle creating/removing shortcuts on Windows when installing/uninstalling
if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 1280,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    icon: path.join(__dirname, '../maxon logo.ico')
  });

  // In production, use the built app
  if (app.isPackaged) {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  } else {
    // In development, use the Vite dev server
    mainWindow.loadURL('http://localhost:1420');
    // Open DevTools in development mode
    mainWindow.webContents.openDevTools();
  }
}

// Create window when app is ready
app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// File operations handlers - Use consistent channel names
ipcMain.handle('dialog:openFile', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      { name: 'License Files', extensions: ['lic', 'txt'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });
  
  if (canceled) {
    return null;
  }
  
  return filePaths[0];
});

ipcMain.handle('fs:readFile', async (_, filePath) => {
  try {
    const content = await fs.promises.readFile(filePath, 'utf-8');
    return content;
  } catch (error) {
    console.error('Error reading file:', error);
    throw error;
  }
});

ipcMain.handle('dialog:saveFile', async (_, defaultPath) => {
  const { canceled, filePath } = await dialog.showSaveDialog({
    defaultPath: defaultPath,
    filters: [
      { name: 'License Files', extensions: ['lic'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });

  if (canceled) {
    return null;
  }

  return filePath;
});

ipcMain.handle('fs:saveFile', async (_, filePath, content) => {
  try {
    await fs.promises.writeFile(filePath, content, 'utf-8');
    return true;
  } catch (error) {
    console.error('Error saving file:', error);
    throw error;
  }
});

// Handle saving to destination folder
ipcMain.handle('fs:saveToDestination', async (_, destinationPath, fileName, content) => {
  try {
    const fullPath = path.join(destinationPath, fileName);
    await fs.promises.writeFile(fullPath, content, 'utf-8');
    return fullPath;
  } catch (error) {
    console.error('Error saving file to destination:', error);
    throw error;
  }
});

// --- Search Functionality Handlers ---

// Handle opening directory dialog
ipcMain.handle('dialog:openDirectory', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, { // mainWindow might be needed for parent window context
    properties: ['openDirectory']
  });
  if (canceled || filePaths.length === 0) {
    return null;
  }
  return filePaths[0]; // Return selected directory path
});

// Handle searching license files (renamed and generalized)
ipcMain.handle('search-licenses', async (_, { folderPath, searchTerm }) => {
  if (!folderPath || !searchTerm) {
    throw new Error('Folder path and search term are required.');
  }

  const matchingFiles = [];
  const lowerSearchTerm = searchTerm.toLowerCase();
  try {
    const files = await fs.promises.readdir(folderPath);
    const licFiles = files.filter(file => file.toLowerCase().endsWith('.lic'));

    for (const file of licFiles) {
      const filePath = path.join(folderPath, file);
      try {
        const content = await fs.promises.readFile(filePath, 'utf-8');
        const lowerContent = content.toLowerCase();
        
        // Check if the term exists anywhere in the file
        if (lowerContent.includes(lowerSearchTerm)) {
          matchingFiles.push(filePath); 
        }
      } catch (readError) {
        console.error(`Error reading file ${filePath}:`, readError);
      }
    }
  } catch (dirError) {
    console.error(`Error reading directory ${folderPath}:`, dirError);
    throw new Error(`Failed to read directory: ${folderPath}`);
  }

  return matchingFiles; // Return array of paths
});

// --- End Search Functionality Handlers ---