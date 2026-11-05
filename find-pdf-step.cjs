const fs = require('fs');
const readline = require('readline');
const rl = readline.createInterface({
  input: fs.createReadStream('C:/Users/akhba/.gemini/antigravity/brain/4eb7565e-148c-4955-9ba5-421038c83090/.system_generated/logs/transcript_full.jsonl')
});
rl.on('line', (line) => {
  if (line.includes('"media"') && line.includes('.pdf')) {
    const obj = JSON.parse(line);
    console.log('PDF step_index:', obj.step_index, 'media:', obj.media);
  }
});
