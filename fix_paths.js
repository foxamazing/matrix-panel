import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseDir = path.resolve(__dirname, 'src/components/homarr');
const targetLib = path.resolve(__dirname, 'src/lib/utils.ts');

function getRelativePath(filePath) {
    const fromDir = path.dirname(path.resolve(filePath));
    const toFile = targetLib.replace(/\.ts$/, '');

    let relative = path.relative(fromDir, toFile);
    relative = relative.replace(/\\/g, '/');
    if (!relative.startsWith('.')) {
        relative = './' + relative;
    }
    return relative;
}

function processDirectory(dir) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            processDirectory(fullPath);
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            const correctPath = getRelativePath(fullPath);

            // Match any import of cn from something that ends in lib/utils
            const regex = /import\s*{\s*cn\s*}\s*from\s*["'].*?\/lib\/utils["']/g;
            const newContent = content.replace(regex, `import { cn } from "${correctPath}"`);

            if (content !== newContent) {
                fs.writeFileSync(fullPath, newContent);
                console.log(`Updated: ${fullPath} -> ${correctPath}`);
            }
        }
    });
}

console.log(`Starting path fix in: ${baseDir}`);
processDirectory(baseDir);
console.log('Done.');
