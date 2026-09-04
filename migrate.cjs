const fs = require('fs');
const file = 'src/data/sampleData.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/status:\s*'([^']+)',/g, (match, status) => {
  let devStatus = 'draft';
  let refStage = 'draft';

  if (status === 'draft') {
    devStatus = 'draft';
    refStage = 'draft';
  } else if (status === 'needs-refinement') {
    devStatus = 'draft';
    refStage = 'needs-refinement';
  } else if (status === 'under-review') {
    devStatus = 'draft';
    refStage = 'under-review';
  } else if (status === 'ready') {
    devStatus = 'draft';
    refStage = 'ready';
  } else if (status === 'in-progress') {
    devStatus = 'in-progress';
    refStage = 'ready';
  } else if (status === 'blocked') {
    devStatus = 'blocked';
    refStage = 'ready';
  } else if (status === 'done') {
    devStatus = 'done';
    refStage = 'ready';
  }

  return `devStatus: '${devStatus}',\n    refinementStage: '${refStage}',`;
});

fs.writeFileSync(file, content);
console.log('Done migrating sample data.');
