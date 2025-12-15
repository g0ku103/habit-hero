import React, { useState } from 'react';
import { createHabit } from '../api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const HabitForm = ({ onHabitAdded }) => {
  const today = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    name: '',
    frequency: 'daily',
    category: 'general',
    start_date: today
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Habit name is required!');
      return;
    }

    setLoading(true);
    try {
      await createHabit(form);
      toast.success('Habit added successfully! 🎉');
      setForm({ ...form, name: '' }); // Clear name field
      if (onHabitAdded) onHabitAdded(); // Refresh list if needed
    } catch (err) {
      toast.error('Failed to add habit');
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '40px', background: 'white', borderRadius: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)', margin: '40px auto', maxWidth: '600px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>Create New Habit</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Habit Name</label>
          <input
            type="text"
            placeholder="e.g., Drink Water"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }}
            required
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Frequency</label>
          <select
            value={form.frequency}
            onChange={(e) => setForm({ ...form, frequency: e.target.value })}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
          </select>
        </div>

        <div style={{ marginBottom: '20px' }}>
  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Category (custom allowed)</label>
  <input
    type="text"
    placeholder="e.g., fitness, productivity"
    value={form.category}
    onChange={(e) => setForm({ ...form, category: e.target.value.toLowerCase() })}
    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }}
    required
  />
</div>

        <div style={{ marginBottom: '30px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Start Date</label>
          <input
            type="date"
            value={form.start_date}
            onChange={(e) => setForm({ ...form, start_date: e.target.value })}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '14px',
            background: '#4BC0C0',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1.1em',
            cursor: 'pointer'
          }}
        >
          {loading ? 'Adding...' : 'Add Habit'}
        </button>
      </form>

      <ToastContainer position="bottom-center" />
    </div>
  );
};

export default HabitForm;