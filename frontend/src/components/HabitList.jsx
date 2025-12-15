import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  fetchHabits,
  createProgress,
  deleteHabit,
  fetchMotivation
} from '../api';

const HabitList = ({ onProgressLogged }) => {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  // Notes & motivation per habit
  const [notes, setNotes] = useState({});
  const [motivation, setMotivation] = useState({});

  const loadHabits = async () => {
    setLoading(true);
    try {
      const data = await fetchHabits(selectedDate);
      setHabits(data);
    } catch {
      toast.error('Failed to load habits');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadHabits();
  }, [selectedDate]);

  const handleDone = async (habitId) => {
    try {
      await createProgress({
        habit_id: habitId,
        completed: 1,
        notes: notes[habitId] || ''
      });

      toast.success('Marked as done!');
      setNotes(prev => ({ ...prev, [habitId]: '' }));
      loadHabits();
      if (onProgressLogged) onProgressLogged();
    } catch (err) {
      toast.error(err.message || 'Already completed');
    }
  };

  // ✅ FIX IS HERE
  const handleMotivation = async (habitId) => {
    try {
      const data = await fetchMotivation(habitId);

      // Store motivation DIRECTLY
      setMotivation(prev => ({
        ...prev,
        [habitId]: data
      }));
    } catch {
      toast.error('Failed to load motivation');
    }
  };

  const handleDelete = async (habitId) => {
    if (!window.confirm('Delete this habit permanently?')) return;
    try {
      await deleteHabit(habitId);
      toast.success('Habit deleted');
      loadHabits();
    } catch {
      toast.error('Delete failed');
    }
  };

  if (loading) {
    return <p style={{ textAlign: 'center', padding: 40 }}>Loading…</p>;
  }

  return (
    <div style={{ padding: 40, maxWidth: 1400, margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center' }}>My Habits</h2>

      {/* Date Filter */}
      <div style={{ textAlign: 'center', marginBottom: 30 }}>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 30
        }}
      >
        {habits.map(habit => (
          <div
            key={habit.id}
            style={{
              padding: 30,
              borderRadius: 20,
              background: habit.completed_today
                ? 'linear-gradient(135deg,#ecfdf5,#fff)'
                : '#fff',
              boxShadow: '0 15px 40px rgba(0,0,0,0.12)'
            }}
          >
            <h3>{habit.name}</h3>
            <p>Category · {habit.category}</p>
            <p>🔥 Streak: <b>{habit.current_streak}</b></p>
            <p>📈 Success: <b>{habit.success_rate}%</b></p>

            {/* Notes */}
            {!habit.completed_today && (
              <textarea
                placeholder="How did it feel today? (optional)"
                value={notes[habit.id] || ''}
                onChange={(e) =>
                  setNotes(prev => ({
                    ...prev,
                    [habit.id]: e.target.value
                  }))
                }
                style={{
                  width: '100%',
                  padding: 10,
                  borderRadius: 10,
                  marginTop: 10
                }}
              />
            )}

            {/* Mark Done */}
            <button
              disabled={habit.completed_today}
              onClick={() => handleDone(habit.id)}
              style={{
                width: '100%',
                marginTop: 15,
                padding: 14,
                borderRadius: 12,
                border: 'none',
                fontWeight: 600,
                background: habit.completed_today ? '#22c55e' : '#4BC0C0',
                color: 'white',
                cursor: habit.completed_today ? 'not-allowed' : 'pointer'
              }}
            >
              {habit.completed_today ? 'Completed ✔' : 'Mark Done'}
            </button>

            {/* Motivation */}
            <button
              onClick={() => handleMotivation(habit.id)}
              style={{
                width: '100%',
                marginTop: 10,
                padding: 12,
                borderRadius: 12,
                border: '1px solid #e5e7eb',
                background: '#f8fafc',
                cursor: 'pointer'
              }}
            >
              Get Motivation
            </button>

            {motivation[habit.id]?.quote && (
              <div
                style={{
                  marginTop: 15,
                  padding: 15,
                  borderRadius: 12,
                  background: '#f1f5f9',
                  fontSize: '0.95rem'
                }}
              >
                <p><b>{motivation[habit.id].quote}</b></p>
                <small>{motivation[habit.id].context}</small>
              </div>
            )}

            {/* Delete */}
            <button
              onClick={() => handleDelete(habit.id)}
              style={{
                width: '100%',
                marginTop: 10,
                padding: 12,
                borderRadius: 12,
                border: '1px solid #ef4444',
                background: '#fff',
                color: '#ef4444'
              }}
            >
              Delete Habit
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HabitList;
