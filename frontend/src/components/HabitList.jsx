import React, { useState, useEffect } from 'react';
import { fetchHabits, createProgress } from '../api';
import { toast } from 'react-toastify';

const HabitList = ({ onProgressLogged }) => {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadHabits = async () => {
    setLoading(true);
    try {
      const data = await fetchHabits();
      setHabits(data);
    } catch (err) {
      toast.error('Failed to load habits');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadHabits();
  }, []);

  const handleCheckIn = async (habitId, notes = '') => {
    try {
      await createProgress({
        habit_id: habitId,
        completed: 1,
        notes: notes.trim()
      });
      toast.success('Progress logged! Keep going! 💪');
      loadHabits(); // Refresh list
      if (onProgressLogged) onProgressLogged(); // Refresh dashboard
    } catch (err) {
      toast.error(err.message || 'Already logged today or error');
    }
  };

  const [notesOpen, setNotesOpen] = useState(null); // Which habit has notes open
  const [currentNotes, setCurrentNotes] = useState('');

  if (loading) return <p style={{ textAlign: 'center', padding: '50px' }}>Loading habits...</p>;

  if (habits.length === 0) {
    return <p style={{ textAlign: 'center', padding: '50px' }}>No habits yet. Add one!</p>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '40px' }}>My Habits</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
        {habits.map(habit => (
          <div key={habit.id} style={{
            background: 'white',
            padding: '30px',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 10px', fontSize: '1.4em' }}>{habit.name}</h3>
            <p style={{ color: '#666', marginBottom: '20px' }}>Category: <strong>{habit.category}</strong></p>

            {/* Placeholder for streak & rate – we'll enhance later */}
            <p>Current Streak: <strong>Calculating...</strong></p>
            <p>Success Rate: <strong>Calculating...</strong></p>

            <button
              onClick={() => setNotesOpen(habit.id)}
              style={{
                width: '100%',
                padding: '14px',
                background: '#4BC0C0',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1.1em',
                marginTop: '20px',
                cursor: 'pointer'
              }}
            >
              Mark Done Today
            </button>

            {notesOpen === habit.id && (
              <div style={{ marginTop: '20px' }}>
                <textarea
                  placeholder="How did it go? (optional)"
                  value={currentNotes}
                  onChange={(e) => setCurrentNotes(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc', height: '80px' }}
                />
                <div style={{ marginTop: '10px' }}>
                  <button onClick={() => {
                    handleCheckIn(habit.id, currentNotes);
                    setNotesOpen(null);
                    setCurrentNotes('');
                  }} style={{ background: '#36A2EB', padding: '10px 20px', color: 'white', border: 'none', borderRadius: '6px', marginRight: '10px' }}>
                    Submit
                  </button>
                  <button onClick={() => {
                    setNotesOpen(null);
                    setCurrentNotes('');
                  }} style={{ background: '#ccc', padding: '10px 20px', color: 'black', border: 'none', borderRadius: '6px' }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HabitList;