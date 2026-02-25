const fs = require('fs');
const path = require('path');

const htmlFile = 'liquid-glass-v5.html';
const imageFile = 'app-icons-v2.png';

// Read the image file
const imageBuffer = fs.readFileSync(path.join(__dirname, imageFile));
const base64Image = imageBuffer.toString('base64');
const dataUri = `data:image/png;base64,${base64Image}`;

// Read the HTML file
let htmlContent = fs.readFileSync(path.join(__dirname, htmlFile), 'utf8');

// Replace the image path with the data URI
// The target string is: new THREE.TextureLoader().load('./app-icons-v2.png',
// We want to replace './app-icons-v2.png' with the data URI
const searchString = "new THREE.TextureLoader().load('./app-icons-v2.png',";
const replaceString = `new THREE.TextureLoader().load('${dataUri}',`;

if (htmlContent.includes(searchString)) {
    htmlContent = htmlContent.replace(searchString, replaceString);
    fs.writeFileSync(path.join(__dirname, htmlFile), htmlContent);
    console.log('Successfully replaced image path with base64 data URI.');
} else {
    console.error('Could not find the target string in the HTML file.');
    // Try a more lenient search just in case of whitespace differences, though previous file read suggests exact match
    // Or maybe the user hasn't updated the file yet? No, I did update it.
    // Let's print a small snippet around where we expect it
    const index = htmlContent.indexOf('new THREE.TextureLoader().load(');
    if (index !== -1) {
        console.log('Found loader call:', htmlContent.substring(index, index + 100));
    }
    process.exit(1);
}
