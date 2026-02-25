const fs = require('fs');
const path = require('path');

const htmlFile = 'liquid-glass-v5.html';
const b64File = 'icon_b64.txt';

try {
    const b64Data = fs.readFileSync(path.join(__dirname, b64File), 'utf8').trim();
    let htmlContent = fs.readFileSync(path.join(__dirname, htmlFile), 'utf8');

    // Make the search string more robust by looking for the filename only primarily
    // But sticking to the specific line we saw earlier: new THREE.TextureLoader().load('./app-icons-v2.png',
    const searchString = "./app-icons-v2.png";

    if (htmlContent.includes(searchString)) {
        // We'll replace just the path string
        const newContent = htmlContent.replace(searchString, b64Data);
        fs.writeFileSync(path.join(__dirname, htmlFile), newContent);
        console.log('Successfully replaced image path with base64 data.');
    } else {
        console.error('Target string "./app-icons-v2.png" not found in HTML.');
        process.exit(1);
    }
} catch (err) {
    console.error('Error:', err);
    process.exit(1);
}
