import React from 'react';
import { Search, Bell } from 'lucide-react';
import './components.css';

export default function Header() {
  return (
    <header className="top-header">
      <div className="search-bar">
        <Search size={18} color="var(--text-secondary)" />
        <input type="text" placeholder="Search vehicles, shipments, routes..." />
      </div>
      <div className="header-actions">
        <button className="icon-btn notification-btn">
          <Bell size={24} />
          <span className="badge">3</span>
        </button>
        <div className="profile">
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Profile" />
          <div className="profile-info">
            <span className="name">Admin User</span>
            <span className="role">Logistics Manager</span>
          </div>
        </div>
      </div>
    </header>
  );
}
