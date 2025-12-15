import React, { useState } from 'react';
import { fetchAISuggestions, createHabit } from '../api';
import { toast } from 'react-toastify';

const AISuggestions = ({ onHabitAdded }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState('');

  const getSuggestions = async () => {
    setLoading(true);
    try {
      const data = await fetchAISuggestions(category || null);
      setSuggestions(data.suggestions || []);
    } catch (err) {
      toast.error('Failed to get suggestions');
    }
    setLoading(false);
  };

  const addSuggestedHabit = async (suggestion) => {
    try {
      await createHabit({
        name: suggestion.name,
        category: suggestion.category === 'inferred' ? 'general' : suggestion.category,
        frequency: 'daily',
        start_date: new Date().toISOString().split('T')[0]
      });
      toast.success(`Added "${suggestion.name}"!`);
      if (onHabitAdded) onHabitAdded();
    } catch (err) {
      toast.error('Failed to add');
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>AI Habit Suggestions</h2>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <input
          type="text"
          placeholder="Optional: Enter category (e.g., health)"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{ padding: '12px', width: '300px', borderRadius: '8px', border: '1px solid #ccc' }}
        />
        <button
          onClick={getSuggestions}
          disabled={loading}
          style={{ padding: '12px 24px', background: '#4BC0C0', color: 'white', border: 'none', borderRadius: '8px', marginLeft: '10px' }}
        >
          {loading ? 'Thinking...' : 'Get Suggestions'}
        </button>
      </div>

      {suggestions.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#666' }}>Click to get personalized habit ideas!</p>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {suggestions.map((s, i) => (
            <div key={i} style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: '0 0 8px' }}>{s.name}</h4>
                <p style={{ color: '#666', margin: 0 }}>Category: {s.category}</p>
              </div>
              <button
                onClick={() => addSuggestedHabit(s)}
                style={{ padding: '10px 20px', background: '#36A2EB', color: 'white', border: 'none', borderRadius: '8px' }}
              >
                Add This Habit
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AISuggestions;