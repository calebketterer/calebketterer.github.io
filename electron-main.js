const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const targetGame = process.env.TARGET_GAME || '';
  
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    autoHideMenuBar: true,
    title: `Caleb Ketterer Games ${targetGame ? `- ${targetGame.toUpperCase()}` : ''}`
  });

  mainWindow.loadFile(
    path.join(__dirname, 'dist/calebketterer.github.io/browser/index.html'),
    targetGame ? { hash: targetGame } : {}
  );
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});