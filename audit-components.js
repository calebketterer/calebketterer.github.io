const fs = require('fs');
const path = require('path');

try {
  console.log("\n========================================");
  console.log("   TOTAL COMPONENT & GAME FOLDER AUDIT  ");
  console.log("========================================");
  
  const appDir = path.join(__dirname, 'src', 'app');
  const gamesDir = path.join(__dirname, 'src', 'app', 'games');

  const getFolderSize = (dirPath) => {
    let size = 0;
    if (!fs.existsSync(dirPath)) return size;
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);
      if (stats.isDirectory()) {
        size += getFolderSize(filePath);
      } else {
        size += stats.size;
      }
    }
    return size;
  };

  // 1. Audit individual game folders under src/app/games
  if (fs.existsSync(gamesDir)) {
    console.log("\n--- GAME DIRECTORIES (src/app/games) ---");
    const gameFolders = fs.readdirSync(gamesDir);
    for (const folder of gameFolders) {
      const folderPath = path.join(gamesDir, folder);
      if (fs.statSync(folderPath).isDirectory()) {
        const sizeInKB = (getFolderSize(folderPath) / 1024).toFixed(2);
        const name = folder.toUpperCase().padEnd(16, ' ');
        console.log(` 🎮 ${name} -> ${sizeInKB} KB`);
      }
    }
  } else {
    console.log("\n⚠️ Could not locate games directory at:", gamesDir);
  }

  // 2. Audit all main top-level subfolders under src/app
  if (fs.existsSync(appDir)) {
    console.log("\n--- CORE APP SUB-DIRECTORIES (src/app/*) ---");
    const appFolders = fs.readdirSync(appDir);
    for (const folder of appFolders) {
      const folderPath = path.join(appDir, folder);
      if (fs.statSync(folderPath).isDirectory()) {
        const sizeInKB = (getFolderSize(folderPath) / 1024).toFixed(2);
        const name = folder.toUpperCase().padEnd(16, ' ');
        console.log(` 📦 ${name} -> ${sizeInKB} KB`);
      }
    }

    // 3. Audit entire src/app folder size
    const totalAppSizeMB = (getFolderSize(appDir) / (1024 * 1024)).toFixed(2);
    console.log("\n----------------------------------------");
    console.log(` 📂 TOTAL APP FOLDER SIZE -> ${totalAppSizeMB} MB`);
  } else {
    console.error(`Could not locate app directory at: ${appDir}`);
  }
  
  console.log("========================================\n");
} catch (e) {
  console.error("Audit failed:", e);
}