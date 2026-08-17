import React, { useState } from 'react';
import { api } from '../services/mockData';
import { generateBaseline, optimizeRoutes } from '../services/optimizationService';
import { Play, CheckCircle, RotateCcw, Truck } from 'lucide-react';
import './components.css';

export default function Optimization({ onOptimizeComplete }) {
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [optState, setOptState] = useState(api.getOptimizationState());

  const handleOptimize = () => {
    setLoading(true);
    setStatusText('Analyzing fleet constraints...');
    
    setTimeout(() => {
      setStatusText('Generating baseline routes...');
      const vehicles = api.getVehicles();
      const shipments = api.getShipments();
      
      const baseline = generateBaseline(vehicles, shipments);
      
      setTimeout(() => {
        setStatusText('Optimizing shipment allocation via CVRP...');
        
        const optimized = optimizeRoutes(vehicles, shipments);
        
        setTimeout(() => {
          const savings = baseline.totalDistance > 0 
            ? (((baseline.totalDistance - optimized.totalDistance) / baseline.totalDistance) * 100).toFixed(1)
            : 0;

          const newOptState = { baseline, optimized, savings };
          
          api.saveOptimizationResult(optimized.vehicles, optimized.shipments, newOptState);
          setOptState(newOptState);
          setLoading(false);
          if (onOptimizeComplete) onOptimizeComplete();
        }, 800);
      }, 800);
    }, 800);
  };

  const resetDemo = () => {
    api.resetDemo();
    setOptState(null);
    if (onOptimizeComplete) onOptimizeComplete();
  };

  return (
    <div className="optimization-view">
      <div className="page-header" style={{ marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', marginBottom: '4px' }}>Fleet Optimization Engine</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>CVRP Deterministic Heuristic Algorithm</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-secondary" onClick={resetDemo} style={{ background: 'var(--bg-panel)', color: 'white', padding: '10px 20px', borderRadius: '6px', border: '1px solid var(--border-color)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <RotateCcw size={16} /> Reset Demo
          </button>
          <button className="btn-primary" onClick={handleOptimize} disabled={loading} style={{ padding: '10px 20px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {loading ? <span className="spinner"></span> : <Play size={16} />} 
            {loading ? 'Processing...' : 'OPTIMIZE FLEET'}
          </button>
        </div>
      </div>

      {loading && (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', marginBottom: '20px' }}>
          <h3 style={{ color: 'var(--accent-cyan)' }}>{statusText}</h3>
        </div>
      )}

      {optState && !loading && (
        <div className="content-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          {/* Baseline Panel */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h3 style={{ color: 'var(--text-secondary)', marginBottom: '15px' }}>BASELINE ROUTING (Naive Allocation)</h3>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '10px' }}>{optState.baseline.totalDistance.toFixed(1)} km</div>
            <ul style={{ listStyle: 'none', lineHeight: '2' }}>
              <li><strong>Vehicles Used:</strong> {optState.baseline.vehicles.filter(v => v.currentLoad > 0).length}</li>
              <li><strong>Total Capacity Utilization:</strong> {
                ((optState.baseline.vehicles.reduce((sum, v) => sum + v.currentLoad, 0) / 
                optState.baseline.vehicles.reduce((sum, v) => sum + v.capacity, 0)) * 100).toFixed(1)
              }%</li>
            </ul>
          </div>

          {/* Optimized Panel */}
          <div className="glass-panel" style={{ padding: '20px', border: '1px solid var(--accent-emerald)' }}>
            <h3 style={{ color: 'var(--accent-emerald)', marginBottom: '15px' }}><CheckCircle size={18} style={{ verticalAlign: 'middle' }}/> OPTIMIZED ROUTING (CVRP)</h3>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '10px', color: 'var(--accent-emerald)' }}>
              {optState.optimized.totalDistance.toFixed(1)} km
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '15px', color: 'var(--accent-cyan)' }}>
              DISTANCE SAVED: {optState.savings}%
            </div>
            <ul style={{ listStyle: 'none', lineHeight: '2' }}>
              <li><strong>Vehicles Used:</strong> {optState.optimized.vehicles.filter(v => v.currentLoad > 0).length}</li>
              <li><strong>Total Capacity Utilization:</strong> {
                ((optState.optimized.vehicles.reduce((sum, v) => sum + v.currentLoad, 0) / 
                optState.optimized.vehicles.reduce((sum, v) => sum + v.capacity, 0)) * 100).toFixed(1)
              }%</li>
            </ul>
          </div>
        </div>
      )}

      {optState && !loading && (
        <div className="glass-panel" style={{ padding: '20px', marginTop: '20px' }}>
          <h3 style={{ marginBottom: '15px' }}>Why these routes?</h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            The CVRP engine evaluated all high-priority shipments first. It constrained assignments strictly to available vehicle capacity. Instead of random assignment (Baseline), it clustered geographically proximate destinations using a Nearest-Neighbor heuristic, minimizing empty travel distance and returning vehicles efficiently to the Mumbai Central Depot.
          </p>
        </div>
      )}
    </div>
  );
}
