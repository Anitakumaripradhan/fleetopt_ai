import React, { useState, useEffect } from 'react';
import { api } from '../services/mockData';
import './components.css';

export default function ShipmentsTable({ refreshTrigger }) {
  const [shipments, setShipments] = useState(api.getShipments());

  useEffect(() => {
    setShipments(api.getShipments());
  }, [refreshTrigger]);

  const getPriorityColor = (prio) => {
    if (prio === 'HIGH') return 'var(--accent-red)';
    if (prio === 'MEDIUM') return 'var(--accent-purple)';
    return 'var(--accent-cyan)';
  };

  return (
    <div className="shipments-section glass-panel">
      <div className="panel-header">
        <h3>Current Shipments</h3>
      </div>
      <div className="table-container" style={{ maxHeight: '400px', overflowY: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Dest</th>
              <th>Weight</th>
              <th>Priority</th>
              <th>Vehicle</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {shipments.map(s => (
              <tr key={s.id}>
                <td><strong>{s.id}</strong></td>
                <td>{s.destinationName}</td>
                <td>{s.weight} kg</td>
                <td><span style={{ color: getPriorityColor(s.priority), fontWeight: 'bold' }}>{s.priority}</span></td>
                <td>{s.vehicleName}</td>
                <td>
                  <span className={`status-badge ${s.status === 'Assigned' ? 'on-time' : 'delayed'}`}>
                    {s.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
