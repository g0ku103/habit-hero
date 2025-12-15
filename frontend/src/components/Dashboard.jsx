import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { fetchDashboardAnalytics } from '../api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import bgImage from '../assets/Dashboard1.jpg';
import HabitHeatmap from './HabitHeatmap';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const COLORS = ['#36A2EB', '#FF6384', '#4BC0C0', '#9966FF', '#FFCE56', '#FF9F40'];

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'top' },
    tooltip: { mode: 'index', intersect: false },
  },
  scales: {
    x: { grid: { display: false } },
    y: {
      beginAtZero: true,
      ticks: { callback: (v) => `${v}%` },
    },
  },
};

const styles = {
  page: {
    minHeight: '100vh',
    background: '#f8fafc',
    fontFamily: 'Inter, system-ui, sans-serif',
  },

  /* ===== HERO STRIP ===== */
  heroStrip: {
    width: '100vw',
    height: '260px',
    marginLeft: 'calc(-50vw + 50%)',
    backgroundImage: `
      linear-gradient(
        to right,
        rgba(0,0,0,0.65),
        rgba(0,0,0,0.25)
      ),
      url(${bgImage})
    `,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  heroContent: {
    textAlign: 'center',
    color: '#ffffff',
    padding: '0 20px',
  },

  heroTitle: {
    fontSize: '3.2rem',
    fontWeight: 800,
    marginBottom: '12px',
  },

  heroSubtitle: {
    fontSize: '1.1rem',
    color: '#e5e7eb',
    maxWidth: '600px',
    margin: '0 auto',
  },

  /* ===== CONTENT ===== */
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '40px',
  },

  controls: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '40px',
  },

  select: {
    padding: '12px 20px',
    borderRadius: '999px',
    background: '#ffffff',
    border: '1px solid #cbd5e1',
    fontSize: '1rem',
    cursor: 'pointer',
  },

  grid2: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '30px',
    marginBottom: '40px',
  },

  card: {
    background: '#ffffff',
    borderRadius: '20px',
    padding: '30px',
    boxShadow: '0 15px 40px rgba(0,0,0,0.12)',
    textAlign: 'center',
  },

  statLabel: {
    color: '#64748b',
    fontSize: '1rem',
  },

  statValue: {
    fontSize: '3.2rem',
    fontWeight: 700,
    marginTop: '10px',
  },

  chartCard: {
    height: '460px',
  },
};

const Dashboard = ({ refreshTrigger }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const loadData = async () => {
      try {
        const analytics = await fetchDashboardAnalytics();
        setData(analytics);
      } catch {
        toast.error('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [refreshTrigger]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100, fontSize: '1.5rem' }}>
        Loading dashboard…
      </div>
    );
  }

  const {
    completion_trend = [],
    category_progress = {},
    overall_success_rate = 0,
    longest_streak = 0,
  } = data;

  const categories = Object.keys(category_progress);

  const categoryDaily = {};
  completion_trend.forEach(day => {
    categories.forEach(cat => {
      if (!categoryDaily[cat]) categoryDaily[cat] = [];
      categoryDaily[cat].push(
        Math.round((day.completions * category_progress[cat]) / 100)
      );
    });
  });

  const colorIndex = Math.max(categories.indexOf(selectedCategory), 0);

  const lineData = {
    labels: completion_trend.map(d => d.date),
    datasets:
      selectedCategory === 'all'
        ? categories.map((cat, i) => ({
            label: cat.toUpperCase(),
            data: categoryDaily[cat] || [],
            borderColor: COLORS[i % COLORS.length],
            backgroundColor: `${COLORS[i % COLORS.length]}33`,
            fill: true,
            tension: 0.35,
          }))
        : [
            {
              label: selectedCategory.toUpperCase(),
              data: categoryDaily[selectedCategory] || [],
              borderColor: COLORS[colorIndex % COLORS.length],
              backgroundColor: `${COLORS[colorIndex % COLORS.length]}44`,
              fill: true,
              tension: 0.35,
            },
          ],
  };

  const barData = {
    labels: categories.map(c => c.toUpperCase()),
    datasets: [
      {
        label: 'Success Rate (%)',
        data: Object.values(category_progress),
        backgroundColor: categories.map((cat, i) =>
          selectedCategory === 'all' || selectedCategory === cat
            ? COLORS[i % COLORS.length]
            : '#e5e7eb'
        ),
        borderRadius: 10,
      },
    ],
  };

  return (
    <div style={styles.page}>
      {/* HERO */}
      <div style={styles.heroStrip}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>Habit Hero</h1>
          <p style={styles.heroSubtitle}>
            Track consistency, performance & streaks beautifully
          </p>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={styles.container}>
        <div style={styles.controls}>
          <select
            style={styles.select}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        {/* STATS */}
        <div style={styles.grid2}>
          <div style={styles.card}>
            <div style={styles.statLabel}>Success Rate</div>
            <div style={{ ...styles.statValue, color: '#36A2EB' }}>
              {overall_success_rate.toFixed(1)}%
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.statLabel}>Longest Streak</div>
            <div style={{ ...styles.statValue, color: '#4BC0C0' }}>
              {longest_streak} 🔥
            </div>
          </div>
        </div>

        {/* CHARTS */}
        <div style={styles.grid2}>
          <div style={{ ...styles.card, ...styles.chartCard }}>
            <Line data={lineData} options={chartOptions} />
          </div>

          <div style={{ ...styles.card, ...styles.chartCard }}>
            <Bar data={barData} options={chartOptions} />
          </div>
        </div>

        {/* 🔥 HEATMAP AT BOTTOM */}
        <HabitHeatmap />
      </div>

      <ToastContainer />
    </div>
  );
};

export default Dashboard;
