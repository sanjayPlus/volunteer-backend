// Function to read and parse JSON file
const fs = require('fs');
function readJSONFile(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        const jsonData = JSON.parse(data);
        return jsonData;
    } catch (error) {
        console.error('Error reading JSON file:', error.message);
        return null;
    }
}
module.exports = readJSONFile;