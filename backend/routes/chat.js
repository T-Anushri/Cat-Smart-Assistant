

import express from 'express';
import { findRelevantContext } from '../rag/tfidf.js';
const router = express.Router();

// POST /api/chat
router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required.' });
    }
    // Find top 3 relevant chunks from the manual
    const contextArr = findRelevantContext(message, 3);
    if (contextArr.length === 0) {
      return res.json({ response: "Sorry, I couldn't find relevant information in the manual." });
    }
    // Join the top 3 chunks as the answer
    const response = contextArr.map((c, idx) => `(${idx + 1}) ${c.text}`).join('\n\n');
    res.json({ response });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

export default router;
