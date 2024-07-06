const fs = require('fs');

const filePath = './serviceAccountKey.json'; // Ganti dengan path yang sesuai

fs.readFile(filePath, { encoding: 'base64' }, (err, data) => {
  if (err) {
    console.error('Error reading file:', err);
    return;
  }
  console.log(data); // Ini akan mencetak string base64
});
