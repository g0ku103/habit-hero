import React from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

const Navigation = ({ children }) => {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>
        Habit Hero
      </h1>
      <Tabs>
        <TabList>
          <Tab>Dashboard</Tab>
          <Tab>My Habits</Tab>
          <Tab>Add Habit</Tab>
          <Tab>AI Suggestions</Tab>
        </TabList>

        {children}
      </Tabs>
    </div>
  );
};

export default Navigation;