import React, { useEffect, useState } from 'react';

/* ===== GitHub-style color scale ===== */
const COLORS = [
  '#ebedf0', // 0
  '#c6e48b', // 1–2
  '#7bc96f', // 3–4
  '#239a3b', // 5–6
  '#196127'  // 7+
];

const getColor = (count) => {
  if (count === 0) return COLORS[0];
  if (count <= 2) return COLORS[1];
  if (count <= 4) return COLORS[2];
  if (count <= 6) return COLORS[3];
  return COLORS[4];
};

const HabitHeatmap = () => {
  const [data, setData] = useState({});

  useEffect(() => {
    const loadHeatmap = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/analytics/heatmap');
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error('Heatmap load failed', err);
      }
    };

    loadHeatmap();
  }, []);

  return (
    <div
      style={{
        maxWidth: '1400px',
        margin: '30px auto',
        padding: '0 40px'
      }}
    >
      {/* ===== Card Wrapper ===== */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e5e7eb',
          padding: '20px 24px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
        }}
      >
        <h3 style={{ marginBottom: 12 }}>🔥 Activity Heatmap</h3>

        {/* ===== Heatmap Grid ===== */}
        <div
          style={{
            display: 'grid',
            gridAutoFlow: 'column',
            gridTemplateRows: 'repeat(7, 12px)',
            gap: 4,
            marginTop: 10
          }}
        >
          {Object.entries(data).map(([date, count]) => (
            <div
              key={date}
              title={`${date} : ${count} habits completed`}
              style={{
                width: 10,
                height: 10,
                backgroundColor: getColor(count),
                borderRadius: 3
              }}
            />
          ))}
        </div>

        {/* ===== Legend ===== */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            marginTop: 12
          }}
        >
          <span style={{ fontSize: 12, color: '#64748b' }}>Less</span>
          {COLORS.map((c) => (
            <div
              key={c}
              style={{
                width: 10,
                height: 10,
                backgroundColor: c,
                borderRadius: 3
              }}
            />
          ))}
          <span style={{ fontSize: 12, color: '#64748b' }}>More</span>
        </div>
      </div>
    </div>
  );
};

export default HabitHeatmap;
