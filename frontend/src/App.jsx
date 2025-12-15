import React, { useState } from 'react';
import Navigation from './components/Navigation';
import Dashboard from './components/dashboard';
import HabitForm from './components/HabitForm';
import HabitList from './components/HabitList';
import AISuggestions from './components/AISuggestions';
import { TabPanel } from 'react-tabs';

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <Navigation>
      <TabPanel>
        <Dashboard refreshTrigger={refreshTrigger} />
      </TabPanel>
      <TabPanel>
        <HabitList onProgressLogged={handleRefresh} />
      </TabPanel>
      <TabPanel>
        <HabitForm onHabitAdded={handleRefresh} />
      </TabPanel>
      <TabPanel>
        <AISuggestions onHabitAdded={handleRefresh} />
      </TabPanel>
    </Navigation>
  );
}

export default App;