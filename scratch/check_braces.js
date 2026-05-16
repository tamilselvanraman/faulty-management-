
const fs = require('fs');
const content = fs.readFileSync('src/app/events/page.tsx', 'utf8');
const lines = content.split('\n');

let balance = 0;
for (let i = 0; i < 215; i++) {
    const line = lines[i];
    for (const char of line) {
        if (char === '{') balance++;
        if (char === '}') balance--;
    }
    if (balance < 0) {
        console.log(`Unbalanced at line ${i + 1}: ${balance}`);
    }
}
console.log(`Final balance at line 215: ${balance}`);
