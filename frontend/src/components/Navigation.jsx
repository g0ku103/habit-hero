import React from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

const Navigation = ({ children }) => {
  return (
    <div style={styles.page}>
      {/* Header */}
      <header style={styles.header}>
        <h1 style={styles.title}>Habit Hero</h1>
        <p style={styles.subtitle}>
          Build consistency. Track progress. Win daily.
        </p>
      </header>

      {/* Tabs */}
      <Tabs>
        <TabList style={styles.tabList}>
          <Tab style={styles.tab} selectedStyle={styles.activeTab}>
            Dashboard
          </Tab>
          <Tab style={styles.tab} selectedStyle={styles.activeTab}>
            My Habits
          </Tab>
          <Tab style={styles.tab} selectedStyle={styles.activeTab}>
            Add Habit
          </Tab>
          <Tab style={styles.tab} selectedStyle={styles.activeTab}>
            AI Suggestions
          </Tab>
        </TabList>

        {/* Content */}
        <div style={styles.content}>
          {children}
        </div>
      </Tabs>
    </div>
  );
};

export default Navigation;

/* ---------- Styles ---------- */

const styles = {
  page: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '30px 40px',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  title: {
    fontSize: '2.6rem',
    fontWeight: 700,
    color: '#1f2937',
    marginBottom: '6px',
  },
  subtitle: {
    fontSize: '1rem',
    color: '#6b7280',
  },
  tabList: {
    display: 'flex',
    justifyContent: 'center',
    gap: '14px',
    border: 'none',
    marginBottom: '30px',
    padding: '10px',
    background: 'rgba(255,255,255,0.7)',
    borderRadius: '999px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
  },
  tab: {
    listStyle: 'none',
    padding: '10px 22px',
    borderRadius: '999px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    color: '#374151',
    border: 'none',
    outline: 'none',
    transition: 'all 0.25s ease',
  },
  activeTab: {
    background: '#4BC0C0',
    color: '#ffffff',
    boxShadow: '0 6px 18px rgba(75,192,192,0.45)',
  },
  content: {
    marginTop: '10px',
  },
};
