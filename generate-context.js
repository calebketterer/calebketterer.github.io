const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const scope = args[0] || 'all';

// Define target directories based on your requested tree views
const SCOPE_CONFIGS = {
    all: path.resolve(__dirname), // Whole repo from root
    app: path.resolve(__dirname, 'src/app'), // App folder, but stops short of games/*/*
    diep: path.resolve(__dirname, 'src/app/games/diep'),
    snake: path.resolve(__dirname, 'src/app/games/snake'),
    sudoku: path.resolve(__dirname, 'src/app/games/sudoku')
};

const targetDir = SCOPE_CONFIGS[scope] || SCOPE_CONFIGS.all;
const IGNORE_DIRS = ['node_modules', '.angular', '.vscode', 'dist', '.git'];

function getFileDescription(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');
        const trimmedContent = content.trim();

        // 1. Parse JSDoc / block comments
        if (trimmedContent.startsWith('/*')) {
            const endIndex = trimmedContent.indexOf('*/');
            if (endIndex !== -1) {
                const commentBody = trimmedContent.substring(2, endIndex);
                const cleanText = commentBody
                    .split('\n')
                    .map(line => line.replace(/^\s*\*\s?/, '').trim())
                    .filter(line => line.length > 0 && !line.startsWith('@') && !/^[\*\-\=]+$/.test(line))
                    .join(' ');
                
                if (cleanText) return cleanText;
            }
        }

        // 2. Fall back to single-line comments
        const lines = content.split('\n');
        for (let line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('//') || trimmed.startsWith('///')) {
                const text = trimmed.replace(/^\/\/{1,3}\s*/, '').trim();
                if (text && !/^[\*\-\=]+$/.test(text)) return text;
            }
            if (trimmed !== '' && !trimmed.startsWith('import') && !trimmed.startsWith('from') && !trimmed.startsWith('/\*') && !trimmed.startsWith('*')) {
                break;
            }
        }
    } catch (e) {
        // Ignore read errors
    }
    return '';
}

function walkDir(dir, prefix = '', depth = 0, maxDepth = 5) {
    let output = '';
    if (depth > maxDepth) return output;

    let entries;
    try {
        entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch (e) {
        return output;
    }

    entries.sort((a, b) => {
        if (a.isDirectory() && !b.isDirectory()) return -1;
        if (!a.isDirectory() && b.isDirectory()) return 1;
        return a.name.localeCompare(b.name);
    });

    entries.forEach((entry, index) => {
        if (IGNORE_DIRS.includes(entry.name)) return;

        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative(path.resolve(__dirname, 'src/app'), fullPath).replace(/\\/g, '/');

        // If running appcontext, block recursion inside specific sub-subfolders like games/*/* or pages/*/*
        if (scope === 'app') {
            const parts = relativePath.split('/');
            if (parts[0] === 'games' && parts.length > 2) return; // Stop at games folders
            if (parts[0] === 'pages' && parts.length > 2) return; // Stop at pages folders
        }

        const isLast = index === entries.length - 1;
        const pointer = isLast ? '└─ ' : '├─ ';
        const childPrefix = prefix + (isLast ? '    ' : '│   ');

        if (entry.isDirectory()) {
            output += `${prefix}${pointer}${entry.name}/\n`;
            output += walkDir(fullPath, childPrefix, depth + 1, maxDepth);
        } else {
            const description = getFileDescription(fullPath);
            if (description) {
                output += `${prefix}${pointer}${entry.name} — *${description}*\n`;
            } else {
                output += `${prefix}${pointer}${entry.name}\n`;
            }
        }
    });

    return output;
}

const rootName = path.basename(targetDir);
let result = `${rootName}/\n` + walkDir(targetDir);
console.log(result);