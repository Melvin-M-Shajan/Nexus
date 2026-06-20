const fs = require('fs')
const { parse } = require('csv-parse/sync');

const csv = fs.readFileSync('c:/Users/melvi/Desktop/Nexus/Interview_Questions_Bank.csv', 'utf8')
const records = parse(csv, { columns: true, skip_empty_lines: true });

const categoriesMap = {}

// Icons mapping matching lucide-react if possible
const icons = {
  'Background': 'User',
  'Project Deep Dive': 'Briefcase',
  'RAG': 'Database',
  'Agents': 'Bot',
  'Coding': 'Code',
  'Vector DB': 'Layers',
  'Embeddings': 'Brain'
}

records.forEach((row, i) => {
  const roundType = row.RoundType
  if (!categoriesMap[roundType]) {
    categoriesMap[roundType] = {
      id: roundType.toLowerCase().replace(/\s+/g, '_'),
      name: roundType,
      icon: icons[roundType] || 'HelpCircle',
      questions: []
    }
  }
  
  categoriesMap[roundType].questions.push({
    id: `csv_q_${i}`,
    priority: row.Priority,
    category: row.Category,
    q: row.Question,
    tierRelevance: row.TierRelevance,
    answerType: row.AnswerType,
    a: row.Answer
  })
})

fs.writeFileSync('c:/Users/melvi/Desktop/Nexus/src/data/csvQuestions.json', JSON.stringify(Object.values(categoriesMap), null, 2))
console.log('Done')
