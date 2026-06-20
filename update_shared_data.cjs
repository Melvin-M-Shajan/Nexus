const fs = require('fs');
const questions = JSON.parse(fs.readFileSync('src/data/csvQuestions.json', 'utf8'));

// Format questions to match what we need
questions.forEach(cat => {
  cat.questions.forEach(q => {
    // Map priority to stars (1 -> 5, 2 -> 4, 3 -> 3)
    let p = parseInt(q.priority);
    q.stars = p === 1 ? 5 : p === 2 ? 4 : 3;
    q.frequency = `Tier: ${q.tierRelevance}`;
    // Map existing fields to match UI or just add them
    q.study = q.category;
    q.fail = q.answerType;
  });
});

let sharedData = fs.readFileSync('src/data/sharedData.js', 'utf8');

// Find the start of interviewCategories
const startStr = "export const interviewCategories = [";
const startIdx = sharedData.indexOf(startStr);

// Find the end of interviewCategories. It ends right before "// ====================================================================="
// "LEETCODE PROBLEMS"
const endStr1 = "// =====================================================================\n// LEETCODE PROBLEMS";
const endStr2 = "// =====================================================================\r\n// LEETCODE PROBLEMS";
const endIdx = sharedData.indexOf(endStr1) !== -1 ? sharedData.indexOf(endStr1) : sharedData.indexOf(endStr2);

if (startIdx !== -1 && endIdx !== -1) {
  const newText = `export const interviewCategories = ${JSON.stringify(questions, null, 2)};\n\n`;
  sharedData = sharedData.substring(0, startIdx) + newText + sharedData.substring(endIdx);
  fs.writeFileSync('src/data/sharedData.js', sharedData);
  console.log('Updated sharedData.js');
} else {
  console.log('Could not find start or end index');
}
