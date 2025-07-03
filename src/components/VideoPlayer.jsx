import React, { useState } from 'react';
import axios from 'axios';
import './VideoPlayer.css';

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ta', name: 'Tamil' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
];

const VideoPlayer = ({ videoId, title, description, transcript }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [language, setLanguage] = useState('en');
  const [translatedTranscript, setTranslatedTranscript] = useState(transcript);
  const [loading, setLoading] = useState(false);

  const thumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  const handleLanguageChange = async (e) => {
    const selectedLang = e.target.value;
    setLanguage(selectedLang);

    if (selectedLang === 'en') {
      setTranslatedTranscript(transcript);
      return;
    }

    try {
      setLoading(true);
      const paragraphs = transcript.split(/\n{2,}|\n/).filter(p => p.trim());
      const translatedParts = [];
      for (const paragraph of paragraphs) {
        const response = await axios.post('http://localhost:5000/api/translate', {
          q: paragraph,
          source: 'en',
          target: selectedLang,
          format: 'text'
        }, {
          headers: { 'Content-Type': 'application/json' }
        });
        translatedParts.push(response.data.translatedText);
      }
      setTranslatedTranscript(translatedParts.join('\n\n'));
    } catch (error) {
      console.error('Translation failed:', error.message);
      alert("Translation failed. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="video-card">
      <h2 className="video-title">📽 Learn from here: {title}</h2>
      <p className="video-description">{description}</p>
      <div className="video-thumbnail">
        {!isPlaying ? (
          <div className="thumbnail-wrapper" onClick={() => setIsPlaying(true)}>
            <img src={thumbnail} alt={title} className="thumbnail" />
            <div className="play-button">▶</div>
          </div>
        ) : (
          <iframe
            width="560"
            height="315"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
            frameBorder="0"
            allow="autoplay; encrypted-media"
            allowFullScreen
            title={title}
          ></iframe>
        )}
      </div>
      <div className="transcript-section">
        <label htmlFor="lang">🌐 Language: </label>
        <select id="lang" value={language} onChange={handleLanguageChange}>
          {LANGUAGES.map(lang => (
            <option key={lang.code} value={lang.code}>{lang.name}</option>
          ))}
        </select>
        <button
          onClick={() => setShowTranscript(!showTranscript)}
          className="transcript-button"
        >
          {showTranscript ? 'Hide Transcript' : 'Show Transcript'}
        </button>
        {showTranscript && (
          <div className="transcript-content">
            {loading ? '🔄 Translating...' : translatedTranscript}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;
