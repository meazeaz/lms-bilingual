const fs = require('fs');
const readline = require('readline');
const rl = readline.createInterface({
  input: fs.createReadStream('C:/Users/akhba/.gemini/antigravity/brain/4eb7565e-148c-4955-9ba5-421038c83090/.system_generated/logs/transcript_full.jsonl')
});
rl.on('line', (line) => {
  if (line.includes('"step_index":1521')) {
    const obj = JSON.parse(line);
    const text = typeof obj.content === 'string' ? obj.content : JSON.stringify(obj.content);
    console.log('Step 1521 text length:', text.length);
    let idx = 0;
    while ((idx = text.indexOf('Glosarium', idx)) !== -1) {
      console.log('Match at', idx, ':', text.slice(idx, idx + 400).replace(/\n/g, ' '));
      idx += 9;
    }
  }
});
