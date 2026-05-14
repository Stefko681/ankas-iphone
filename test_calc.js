const fs = require('fs');
const html = fs.readFileSync('/home/stefko/Documents/kriminalist_baba_telefon/index.html', 'utf8');
console.log(html.includes("function calcAction("));
