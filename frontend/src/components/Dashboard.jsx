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
} from 'chart.js';
import { fetchDashboardAnalytics } from '../api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const COLORS = ['#36A2EB', '#FF6384', '#4BC0C0', '#9966FF', '#FFCE56', '#FF9F40', '#8BC34A'];

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        boxWidth: 12,
        padding: 15,
      },
    },
    tooltip: {
      mode: 'index',
      intersect: false,
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0,0,0,0.05)',
      },
    },
  },
};

const Dashboard = ({ refreshTrigger }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [streakMode] = useState('overall'); // Can extend later

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const analytics = await fetchDashboardAnalytics();
        setData(analytics);
        setError(null);
      } catch (err) {
        setError('Failed to load dashboard data. Is the backend running?');
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [refreshTrigger]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px', fontSize: '1.5em' }}>
        Loading dashboard…
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', color: '#d32f2f' }}>
        <h3>Error Loading Dashboard</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (!data) return null;

  const {
    completion_trend,
    category_progress,
    overall_success_rate,
    longest_streak,
  } = data;

  // Extract unique categories
  const categories = Object.keys(category_progress);

  // Line Chart: Filter by category
  const filteredTrend = selectedCategory === 'all'
    ? completion_trend
    : completion_trend; // Placeholder — for full per-category lines, need backend support

  const lineData = {
    labels: completion_trend.map(d => d.date),
    datasets: [
      {
        label: selectedCategory === 'all' ? 'All Habits' : selectedCategory.toUpperCase(),
        data: filteredTrend.map(d => d.completions),
        borderColor: '#36A2EB',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        tension: 0.3,
        fill: true,
      },
    ],
  };

  // Bar Chart: Highlight selected category
  const barData = {
    labels: categories.map(cat => cat.charAt(0).toUpperCase() + cat.slice(1)),
    datasets: [
      {
        label: 'Success Rate (%)',
        data: Object.values(category_progress),
        backgroundColor: categories.map(cat =>
          selectedCategory === 'all' || selectedCategory === cat
            ? COLORS[categories.indexOf(cat) % COLORS.length]
            : '#e0e0e0'
        ),
        borderRadius: 8,
      },
    ],
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '40px', color: '#333' }}>
        Habit Hero Dashboard
      </h1>

      {/* Controls */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <label style={{ fontWeight: 'bold', marginRight: '10px' }}>
          View Category:
        </label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{
            padding: '10px 16px',
            borderRadius: '8px',
            border: '1px solid #ccc',
            fontSize: '1em',
          }}
        >
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>

        {/* Future: Streak toggle */}
        {/* <button style={{ marginLeft: '20px', padding: '10px 16px' }}>
          {streakMode === 'overall' ? 'Overall' : 'Category'} Streak
        </button> */}
      </div>

      {/* Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '30px',
          marginBottom: '50px',
        }}
      >
        <div style={{ background: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 15px', color: '#555' }}>Overall Success Rate</h3>
          <p style={{ fontSize: '3.5em', margin: '0', color: '#36A2EB', fontWeight: 'bold' }}>
            {overall_success_rate.toFixed(1)}%
          </p>
        </div>

        <div style={{ background: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 15px', color: '#555' }}>Longest Streak</h3>
          <p style={{ fontSize: '3.5em', margin: '0', color: '#4BC0C0', fontWeight: 'bold' }}>
            {longest_streak} <span style={{ fontSize: '0.5em' }}>days 🔥</span>
          </p>
        </div>
      </div>

      {/* Charts */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
          gap: '40px',
          marginTop: '40px',
        }}
      >
        <div
          style={{
            background: 'white',
            padding: '24px',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            height: '500px',
          }}
        >
          <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>
            Completion Trend (Last 30 Days)
          </h3>
          <Line data={lineData} options={chartOptions} />
        </div>

        <div
          style={{
            background: 'white',
            padding: '24px',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            height: '500px',
          }}
        >
          <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>
            Category Performance
          </h3>
          <Bar data={barData} options={chartOptions} />
        </div>
      </div>

      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default Dashboard;