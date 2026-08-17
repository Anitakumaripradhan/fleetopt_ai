import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardCards from './components/DashboardCards';
import LiveMap from './components/LiveMap';
import ShipmentsTable from './components/ShipmentsTable';
import Optimization from './components/Optimization';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = () => setRefreshTrigger(prev => prev + 1);

  return (
    <div className="app-container">
      <Sidebar currentView={currentView} setView={setCurrentView} />
      <main className="main-content">
        <Header />
        <div className="dashboard-content" style={{ padding: '30px' }}>
          
          {currentView === 'dashboard' && (
            <>
              <div className="page-header" style={{ marginBottom: '25px' }}>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', marginBottom: '4px' }}>Fleet Overview</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Real-time monitoring and logistics intelligence</p>
              </div>
              <DashboardCards refreshTrigger={refreshTrigger} />
              <div className="content-grid">
                <LiveMap refreshTrigger={refreshTrigger} />
                <ShipmentsTable refreshTrigger={refreshTrigger} />
              </div>
            </>
          )}

          {currentView === 'optimization' && (
            <Optimization onOptimizeComplete={triggerRefresh} />
          )}

        </div>
      </main>
    </div>
  );
}

export default App;
