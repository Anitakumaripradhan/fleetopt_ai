import React, { useState, useEffect } from 'react';
import { Bus, Leaf, Package, AlertTriangle, TrendingUp, TrendingDown, CheckCircle, Database } from 'lucide-react';
import { api } from '../services/mockData';
import './components.css';

export default function DashboardCards({ refreshTrigger }) {
  const [metrics, setMetrics] = useState(api.getMetrics());

  useEffect(() => {
    setMetrics(api.getMetrics());
  }, [refreshTrigger]);

  return (
    <div className="metrics-grid">
      <div className="metric-card glass-panel">
        <div className="metric-header">
          <div className="metric-icon cyan">
            <Bus size={24} />
          </div>
        </div>
        <div className="metric-value">{metrics.activeVehicles} / {api.getVehicles().length}</div>
        <div className="metric-label">Active Vehicles</div>
      </div>

      <div className="metric-card glass-panel">
        <div className="metric-header">
          <div className="metric-icon emerald">
            <Database size={24} />
          </div>
        </div>
        <div className="metric-value">{metrics.capacityUtilization}%</div>
        <div className="metric-label">Capacity Utilized ({metrics.assignedLoad}kg / {metrics.totalCapacity}kg)</div>
      </div>

      <div className="metric-card glass-panel">
        <div className="metric-header">
          <div className="metric-icon purple">
            <Package size={24} />
          </div>
        </div>
        <div className="metric-value">{metrics.activeShipments}</div>
        <div className="metric-label">Total Shipments ({metrics.unassignedShipments} Unassigned)</div>
      </div>

      <div className="metric-card glass-panel alert">
        <div className="metric-header">
          <div className="metric-icon red">
            <AlertTriangle size={24} />
          </div>
        </div>
        <div className="metric-value">{metrics.highPriority}</div>
        <div className="metric-label">High Priority Pending</div>
      </div>
    </div>
  );
}
