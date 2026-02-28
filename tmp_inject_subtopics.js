// Script: inject subtopics by position into 19_Emotional_Intelligence_for_Leaders.json
// Structure: 12 subtopics × 150 questions each = 1800 questions total
const fs = require('fs');

const SUBTOPICS = [
    'Self-awareness frameworks',
    'Emotional regulation',
    'Conflict navigation',
    'Empathy development',
    'Influence psychology',
    'Feedback conversations',
    'Leadership presence',
    'Trust building',
    'Crisis communication',
    'Team motivation',
    'Decision psychology',
    'Resilience training',
];

const filePath = 'W:\\V S Code files\\hireperfect\\processed-json\\19_Emotional_Intelligence_for_Leaders.json';
const raw = fs.readFileSync(filePath, 'utf-8');
const data = JSON.parse(raw);

console.log('Total rows parsed from PDF:', data.length);

// Assign subtopics by position
const QUESTIONS_PER_SUBTOPIC = Math.ceil(data.length / SUBTOPICS.length);
console.log('Questions per subtopic (estimated):', QUESTIONS_PER_SUBTOPIC);

const fixed = data.map((row, i) => {
    const subtopicIndex = Math.floor(i / QUESTIONS_PER_SUBTOPIC);
    const subtopic = SUBTOPICS[Math.min(subtopicIndex, SUBTOPICS.length - 1)];
    return { ...row, subtopic };
});

// Show distribution
const dist = {};
fixed.forEach(r => { dist[r.subtopic] = (dist[r.subtopic] || 0) + 1; });
console.log('\nSubtopic distribution:');
Object.entries(dist).forEach(([k, v]) => console.log(`  ${k}: ${v}`));

fs.writeFileSync(filePath, JSON.stringify(fixed, null, 2), 'utf-8');
console.log('\nDone. File updated.');
