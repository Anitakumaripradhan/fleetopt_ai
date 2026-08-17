import React from 'react';
import { LayoutDashboard, Bus, Map as MapIcon, PackageSearch, Activity, Settings, Package, Zap } from 'lucide-react';
import './components.css';

export default function Sidebar({ currentView, setView }) {
  return (
    <nav className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <Package className="text-cyan" />
          <span>FleetOpt AI</span>
        </div>
      </div>
      <ul className="nav-links">
        <li className={currentView === 'dashboard' ? 'active' : ''}>
          <a href="#" onClick={(e) => { e.preventDefault(); setView('dashboard'); }}>
            <LayoutDashboard size={20}/> Dashboard
          </a>
        </li>
        <li className={currentView === 'optimization' ? 'active' : ''}>
          <a href="#" onClick={(e) => { e.preventDefault(); setView('optimization'); }} style={currentView !== 'optimization' ? { color: 'var(--accent-emerald)' } : {}}>
            <Zap size={20}/> Optimization
          </a>
        </li>
        <li>
          <a href="#"><Bus size={20}/> Live Fleet</a>
        </li>
        <li>
          <a href="#"><PackageSearch size={20}/> Load Allocation</a>
        </li>
      </ul>
      <div className="sidebar-footer">
        <a href="#"><Settings size={20}/> Settings</a>
      </div>
    </nav>
  );
}
