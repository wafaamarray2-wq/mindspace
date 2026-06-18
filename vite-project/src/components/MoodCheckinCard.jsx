// src/components/MoodCheckinCard.jsx
import React, { useState } from 'react';
import './MoodCheckinCard.css';

const moods = [
  { label: '😊 Happy', emoji: '😊' },
  { label: '😐 Neutral', emoji: '😐' },
  { label: '😔 Sad', emoji: '😔' },
  { label: '😟 Anxious', emoji: '😟' },
  { label: '✨ Other', emoji: '✨' }
];

const MoodCheckinCard = () => {
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState('');
  const handleSubmit = () => {
    // In real app, send to server. Here we just reset.
    setSelected(null);
    setNote('');
  };

  return (
    <section className="mood-card">
      <h2 className="mood-title">How are you feeling today?</h2>
      <div className="mood-options">
        {moods.map(m => (
          <button
            key={m.label}
            className={`mood-option ${selected === m.label ? 'selected' : ''}`}
            onClick={() => setSelected(m.label)}
          >
            <span className="emoji" role="img" aria-label={m.label}>{m.emoji}</span>
            <span className="label">{m.label}</span>
          </button>
        ))}
      </div>
      {selected && (
        <textarea
          className="mood-note"
          placeholder="Optional note..."
          value={note}
          onChange={e => setNote(e.target.value)}
        />
      )}
      <div className="mood-actions">
        <button className="submit-btn" onClick={handleSubmit} disabled={!selected}>Submit</button>
        <button className="skip-btn" onClick={() => { setSelected(null); setNote(''); }}>Skip</button>
      </div>
    </section>
  );
};

export default MoodCheckinCard;
