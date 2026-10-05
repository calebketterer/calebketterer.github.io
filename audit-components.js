const fs = require('fs');
const path = require('path');

try {
  console.log("\n========================================");
  console.log("   TOTAL COMPONENT FOLDER SIZE AUDIT    ");
  console.log("========================================");
  
  const componentsDir = path.join(__dirname, 'src', 'app');
  
  if (fs.existsSync(componentsDir)) {
    const getFolderSize = (dirPath) => {
      let size = 0;
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

    const folders = fs.readdirSync(componentsDir);
    for (const folder of folders) {
      const folderPath = path.join(componentsDir, folder);
      if (fs.statSync(folderPath).isDirectory()) {
        const sizeInKB = (getFolderSize(folderPath) / 1024).toFixed(2);
        const name = folder.toUpperCase().padEnd(16, ' ');
        console.log(` 📦 ${name} -> ${sizeInKB} KB`);
      }
    }
  } else {
    console.error(`Could not locate components directory at: ${componentsDir}`);
  }
  console.log("========================================\n");
} catch (e) {
  console.error("Audit failed:", e);
}