
import fs from 'fs';
import path from 'path';
import naturalPkg from 'natural';
const { TfIdf, PorterStemmer } = naturalPkg;
import sw from 'stopword';

const tfidf = new TfIdf();
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CHUNKS_FILE = path.join(__dirname, '../../data/excavator_guide.txt');

// Read and chunk file
function getChunks(text, chunkSize = 500) {
  const sentences = text.split(/(?<=[.?!])\s+/);
  const chunks = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length <= chunkSize) {
      currentChunk += sentence + ' ';
    } else {
      chunks.push(currentChunk.trim());
      currentChunk = sentence + ' ';
    }
  }
  if (currentChunk) chunks.push(currentChunk.trim());

  return chunks;
}

// Load and preprocess
const rawText = fs.readFileSync(CHUNKS_FILE, 'utf-8');
const chunks = getChunks(rawText);

// Remove stopwords + stem
function clean(text) {
  const tokens = text.split(/\s+/);
  return sw.removeStopwords(tokens).map(t => PorterStemmer.stem(t)).join(' ');
}

// Add chunks to TF-IDF
chunks.forEach((chunk, i) => {
  tfidf.addDocument(clean(chunk), i);
});

// Given a user query, find the top matching chunk
function findRelevantContext(query, topK = 1) {
  const cleanedQuery = clean(query);
  const scores = [];

  tfidf.tfidfs(cleanedQuery, (i, measure) => {
    scores.push({ i, score: measure });
  });

  scores.sort((a, b) => b.score - a.score);
  const best = scores.slice(0, topK).map(({ i, score }) => ({
    text: chunks[i],
    score,
  }));

  return best;
}

export { findRelevantContext };
