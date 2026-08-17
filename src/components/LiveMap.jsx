import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { api } from '../services/mockData';
import { DEPOT_LOCATION } from '../services/mockData';
import 'leaflet/dist/leaflet.css';
import './components.css';

export default function LiveMap({ refreshTrigger }) {
  const [vehicles, setVehicles] = useState(api.getVehicles());
  const [shipments, setShipments] = useState(api.getShipments());
  const [optState, setOptState] = useState(api.getOptimizationState());

  useEffect(() => {
    setVehicles(api.getVehicles());
    setShipments(api.getShipments());
    setOptState(api.getOptimizationState());
  }, [refreshTrigger]);

  const createCustomIcon = (status, color = 'var(--accent-emerald)') => {
    return L.divIcon({
      className: `vehicle-marker ${status === 'Unassigned' ? 'delayed' : ''}`,
      html: `<div style="background-color: ${color}; width: 100%; height: 100%; border-radius: 50%;"></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });
  };

  const depotIcon = L.divIcon({
    className: 'depot-marker',
    html: '<div style="background-color: white; border: 2px solid var(--accent-cyan); width: 20px; height: 20px; border-radius: 4px;"></div>',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });

  // Polyline colors
  const routeColors = ['#06b6d4', '#8b5cf6', '#10b981', '#ef4444', '#f59e0b'];

  return (
    <div className="map-section glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="panel-header">
        <h3>Live Fleet Simulation</h3>
        {optState ? <span style={{ color: 'var(--accent-emerald)', fontWeight: 'bold' }}>✓ OPTIMIZED</span> : <span style={{ color: 'var(--text-secondary)' }}>BASELINE</span>}
      </div>
      <div style={{ flex: 1, position: 'relative', minHeight: '400px' }}>
        <MapContainer 
          center={[DEPOT_LOCATION.lat, DEPOT_LOCATION.lng]} 
          zoom={10} 
          style={{ height: '100%', width: '100%', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}
          zoomControl={true}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; OpenStreetMap &copy; CARTO'
          />
          
          <Marker position={[DEPOT_LOCATION.lat, DEPOT_LOCATION.lng]} icon={depotIcon}>
            <Popup><strong style={{color: 'black'}}>Mumbai Central Depot</strong></Popup>
          </Marker>

          {shipments.map(s => (
            <Marker key={s.id} position={[s.lat, s.lng]} icon={createCustomIcon(s.status, s.status === 'Assigned' ? 'gray' : 'var(--accent-red)')}>
              <Popup>
                <div style={{ color: '#000' }}>
                  <strong>{s.id}</strong><br/>
                  Dest: {s.destinationName}<br/>
                  Weight: {s.weight} kg<br/>
                  Status: {s.status}
                </div>
              </Popup>
            </Marker>
          ))}

          {vehicles.filter(v => v.route && v.route.length > 0).map((v, i) => {
            const positions = v.route.map(r => [r.lat, r.lng]);
            return (
              <React.Fragment key={v.id}>
                <Polyline positions={positions} color={routeColors[i % routeColors.length]} weight={3} opacity={0.7} />
                {v.currentLoad > 0 && (
                  <Marker position={positions[1] || positions[0]} icon={createCustomIcon('moving', routeColors[i % routeColors.length])}>
                    <Popup>
                      <div style={{ color: '#000' }}>
                        <strong>{v.id} ({v.name})</strong><br/>
                        Load: {v.currentLoad} / {v.capacity} kg<br/>
                        Util: {((v.currentLoad / v.capacity) * 100).toFixed(1)}%<br/>
                        Distance: {v.routeDistance ? v.routeDistance.toFixed(1) : 0} km
                      </div>
                    </Popup>
                  </Marker>
                )}
              </React.Fragment>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}
