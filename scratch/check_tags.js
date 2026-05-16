
const fs = require('fs');
const content = fs.readFileSync('src/app/events/page.tsx', 'utf8');
const lines = content.split('\n');

let tags = [];
for (let i = 88; i < 215; i++) {
    const line = lines[i];
    const matches = line.matchAll(/<(\/?[a-zA-Z0-9.]+)/g);
    for (const match of matches) {
        const tag = match[1];
        if (tag.startsWith('/')) {
            const last = tags.pop();
            if (last !== tag.substring(1)) {
                console.log(`Mismatch at line ${i + 1}: Expected </${last}> but found <${tag}>`);
            }
        } else if (!line.includes('/>') || line.indexOf('/>') < line.indexOf('<' + tag)) {
            // Very simplistic check for self-closing tags
            if (!['br', 'hr', 'img', 'input', 'Plus', 'ChevronLeft', 'ChevronRight', 'Download', 'Upload', 'CalendarIcon', 'Filter', 'Clock', 'MapPin', 'CalendarDays', 'Users', 'Info', 'Bookmark', 'X'].includes(tag)) {
                 if (!line.includes('/>')) {
                    tags.push(tag);
                 }
            }
        }
    }
}
console.log('Tags remaining:', tags);
