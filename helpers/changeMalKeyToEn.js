// Function to rename keys in an object
function renameKeys(obj, newKeys) {
    const keyValues = Object.keys(obj).map(key => {
        const newKey = newKeys[key] || key;
        return { [newKey]: obj[key] };
    });
    return Object.assign({}, ...keyValues);
}

// Define new key names
const newKeyNames = {
    "പേര്‌": "name",
    "അമ്മയുടെ പേര്‍": "guardianName",
    "അച്ഛന്റെ പേര്‌": "guardianName",
    "വിട്ടു നമ്പര്‍": "houseNo",
    "പ്രായം : 60": "age",
    "ലിംഗം": "gender"
};

module.exports = { renameKeys, newKeyNames }