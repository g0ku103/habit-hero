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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const analytics = await fetchDashboardAnalytics();
        setData(analytics);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px', fontSize: '1.5em' }}>
        Loading dashboard... 📊
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>
        <h2>Error Loading Dashboard</h2>
        <p>{error}</p>
        <p>Make sure backend is running on http://127.0.0.1:8000</p>
      </div>
    );
  }

  if (!data) {
    return <div>No data available yet. Create some habits!</div>;
  }

  // Extract real data
  const { completion_trend, category_progress, overall_success_rate, longest_streak } = data;

  const lineData = {
    labels: completion_trend.map(d => d.date),
    datasets: [{
      label: 'Daily Completions',
      data: completion_trend.map(d => d.completions),
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      tension: 0.2
    }]
  };

  const barData = {
    labels: Object.keys(category_progress),
    datasets: [{
      label: 'Success Rate (%)',
      data: Object.values(category_progress),
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
    }]
  };

  const lineOptions = {
    responsive: true,
    plugins: { legend: { position: 'top' }, title: { display: true, text: 'Completion Trend (Last 30 Days)' } }
  };

  const barOptions = {
    responsive: true,
    plugins: { legend: { position: 'top' }, title: { display: true, text: 'Category Progress' } },
    scales: { y: { beginAtZero: true, max: 100 } }
  };

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', color: '#333', marginBottom: '40px' }}>Habit Hero Dashboard</h1>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px', marginBottom: '50px' }}>
        <div style={{ background: 'white', padding: '30px', borderRadius: '16px', textAlign: 'center', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 10px' }}>Overall Success Rate</h3>
          <p style={{ fontSize: '3em', margin: '0', color: '#36A2EB', fontWeight: 'bold' }}>
            {overall_success_rate.toFixed(1)}%
          </p>
        </div>
        <div style={{ background: 'white', padding: '30px', borderRadius: '16px', textAlign: 'center', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 10px' }}>Longest Streak</h3>
          <p style={{ fontSize: '3em', margin: '0', color: '#4BC0C0', fontWeight: 'bold' }}>
            {longest_streak} days 🔥
          </p>
        </div>
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginTop: '40px' }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
          <Line data={lineData} options={lineOptions} />
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
          <Bar data={barData} options={barOptions} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;