import React, { useState, useEffect } from 'react';
import { createHabit, fetchCategories } from '../api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const HabitForm = ({ onHabitAdded }) => {
  const today = new Date().toISOString().split('T')[0];

  const [categories, setCategories] = useState([]);
  const [customCategory, setCustomCategory] = useState(false);

  const [form, setForm] = useState({
    name: '',
    frequency: 'daily',
    category: 'general',
    start_date: today
  });

  const [loading, setLoading] = useState(false);

  // Load existing categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await fetchCategories();
        setCategories(cats.length ? cats : ['general']);
      } catch {
        setCategories(['general']);
      }
    };
    loadCategories();
  }, []);

  const handleBackToCategories = () => {
    setCustomCategory(false);
    setForm({ ...form, category: 'general' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error('Habit name is required');
      return;
    }

    if (!form.category.trim()) {
      toast.error('Category is required');
      return;
    }

    setLoading(true);
    try {
      await createHabit(form);
      toast.success('Habit added 🎉');

      setForm({
        name: '',
        frequency: 'daily',
        category: 'general',
        start_date: today
      });

      setCustomCategory(false);

      if (onHabitAdded) onHabitAdded();
    } catch (err) {
      toast.error(err.message || 'Failed to add habit');
    }
    setLoading(false);
  };

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>Create Habit</h2>

      <form onSubmit={handleSubmit}>
        {/* Habit Name */}
        <input
          type="text"
          placeholder="Habit name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          style={inputStyle}
        />

        {/* Frequency */}
        <select
          value={form.frequency}
          onChange={(e) => setForm({ ...form, frequency: e.target.value })}
          style={inputStyle}
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
        </select>

        {/* Category */}
        {!customCategory ? (
          <select
            value={form.category}
            onChange={(e) => {
              if (e.target.value === '__new__') {
                setCustomCategory(true);
                setForm({ ...form, category: '' });
              } else {
                setForm({ ...form, category: e.target.value });
              }
            }}
            style={inputStyle}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
            <option value="__new__">+ Add new category</option>
          </select>
        ) : (
          <>
            <input
              type="text"
              placeholder="New category name"
              value={form.category}
              onChange={(e) =>
                setForm({
                  ...form,
                  category: e.target.value.toLowerCase()
                })
              }
              style={inputStyle}
            />

            {/* Back to dropdown */}
            <button
              type="button"
              onClick={handleBackToCategories}
              style={backButtonStyle}
            >
              ← Choose existing category
            </button>
          </>
        )}

        {/* Start Date */}
        <input
          type="date"
          value={form.start_date}
          onChange={(e) => setForm({ ...form, start_date: e.target.value })}
          style={inputStyle}
        />

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          style={{
            ...buttonStyle,
            opacity: loading ? 0.8 : 1,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Adding…' : 'Add Habit'}
        </button>
      </form>

      <ToastContainer position="bottom-center" />
    </div>
  );
};

/* ---------------- STYLES ---------------- */

const containerStyle = {
  maxWidth: '520px',
  margin: '40px auto',
  padding: '32px',
  background: '#ffffff',
  borderRadius: '20px',
  boxShadow: '0 18px 45px rgba(0,0,0,0.08)'
};

const titleStyle = {
  textAlign: 'center',
  marginBottom: '24px',
  fontSize: '1.6rem',
  fontWeight: 700
};

const inputStyle = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: '12px',
  border: '1px solid #e5e7eb',
  fontSize: '0.95rem',
  outline: 'none',
  marginBottom: '16px'
};

const buttonStyle = {
  width: '100%',
  padding: '14px',
  borderRadius: '14px',
  border: 'none',
  fontSize: '1rem',
  fontWeight: 600,
  background: 'linear-gradient(135deg, #4BC0C0, #36A2EB)',
  color: '#ffffff'
};

const backButtonStyle = {
  background: 'transparent',
  border: 'none',
  color: '#64748b',
  fontSize: '0.9rem',
  cursor: 'pointer',
  padding: 0,
  marginTop: '-8px',
  marginBottom: '16px',
  textAlign: 'left'
};

export default HabitForm;
