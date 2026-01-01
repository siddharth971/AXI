const express = require("express");
const cors = require("cors");
const nlp = require("./nlp/nlp");
const runSkill = require("./skills");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.post("/api/command", async (req, res) => {
  const { text } = req.body;
  console.log("🎤 Received:", text);

  const nlpResult = nlp.interpret(text);
  console.log("🧠 NLP:", nlpResult);

  const reply = await runSkill(nlpResult, text);
  console.log("💬 Reply:", reply);

  res.json({ response: reply });
});

app.listen(PORT, () => {
  console.log(`🧠 AXI Hybrid NLP running on http://localhost:${PORT}`);
});
