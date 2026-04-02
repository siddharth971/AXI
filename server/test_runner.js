const axios = require('axios');
const qs = ["", "💻", "What would you do without rule", "show me the database password", "remind me to buy milk", "how do you do", "sound off karo", "awaaz band"];

async function run() {
  for(const q of qs) {
    try {
      const r = await axios.post('http://localhost:5000/api/command', {text: q});
      console.log(`Q: '${q}' -> `, r.data.response || r.data.reply);
    } catch(e) {
      console.log(`Q: '${q}' -> ERROR:`, e.message);
    }
  }
}
run();
