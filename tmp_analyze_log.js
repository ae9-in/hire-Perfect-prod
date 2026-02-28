const fs = require('fs');
const logs = fs.readdirSync('import-logs').filter(f => f.includes('11-12')).sort();
console.log('Latest log:', logs[logs.length - 1]);
const log = JSON.parse(fs.readFileSync('import-logs/' + logs[logs.length - 1], 'utf-8'));
console.log('totalRows:', log.totalRows, '| validRows:', log.validRows, '| invalidRows:', log.invalidRows);

const re = /subtopic "(.+?)" in/;
const uniqueSubtopics = [...new Set(log.errors.map(e => {
    const m = e.message.match(re);
    return m ? m[1] : null;
}))].filter(Boolean);
console.log('\nUnique failing subtopics (' + uniqueSubtopics.length + '):');
uniqueSubtopics.slice(0, 20).forEach(s => console.log('  -', s));
