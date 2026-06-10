const fs = require('fs');
const path = require('path');

const DIST = path.join(__dirname, 'dist');
const SRC_DIRS = ['custom', 'utils'];
const SRC_FILES = ['BestAppsComponent.js'];

function copyDir(src, dest) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });

for (const file of SRC_FILES) {
    fs.copyFileSync(path.join(__dirname, file), path.join(DIST, file));
}

for (const dir of SRC_DIRS) {
    copyDir(path.join(__dirname, dir), path.join(DIST, dir));
}

console.log('Build complete -> dist/');
