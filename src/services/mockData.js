export const DEPOT_LOCATION = { lat: 19.0760, lng: 72.8777, name: 'Mumbai Central Depot' };

const INITIAL_VEHICLES = [
  { id: 'TRUCK-01', name: 'Heavy Truck Alpha', capacity: 1500, currentLoad: 0, lat: DEPOT_LOCATION.lat, lng: DEPOT_LOCATION.lng, status: 'Available', route: [] },
  { id: 'TRUCK-02', name: 'Heavy Truck Beta', capacity: 1500, currentLoad: 0, lat: DEPOT_LOCATION.lat, lng: DEPOT_LOCATION.lng, status: 'Available', route: [] },
  { id: 'TRUCK-03', name: 'Medium Truck Gamma', capacity: 1000, currentLoad: 0, lat: DEPOT_LOCATION.lat, lng: DEPOT_LOCATION.lng, status: 'Available', route: [] },
  { id: 'VAN-01', name: 'Delivery Van Delta', capacity: 500, currentLoad: 0, lat: DEPOT_LOCATION.lat, lng: DEPOT_LOCATION.lng, status: 'Available', route: [] },
  { id: 'VAN-02', name: 'Delivery Van Epsilon', capacity: 500, currentLoad: 0, lat: DEPOT_LOCATION.lat, lng: DEPOT_LOCATION.lng, status: 'Available', route: [] },
];

const SAMPLE_DESTINATIONS = [
  { name: 'Thane', lat: 19.2183, lng: 72.9781 },
  { name: 'Navi Mumbai', lat: 19.0330, lng: 73.0297 },
  { name: 'Kalyan', lat: 19.2403, lng: 73.1305 },
  { name: 'Panvel', lat: 18.9894, lng: 73.1175 },
  { name: 'Bhiwandi', lat: 19.2813, lng: 73.0483 },
  { name: 'Vasai', lat: 19.3919, lng: 72.8397 },
  { name: 'Virar', lat: 19.4563, lng: 72.7925 },
  { name: 'Mira Road', lat: 19.2856, lng: 72.8691 },
  { name: 'Dombivli', lat: 19.2184, lng: 73.0867 },
  { name: 'Ulhasnagar', lat: 19.2215, lng: 73.1645 },
];

function generateShipments() {
  const shipments = [];
  for (let i = 1; i <= 25; i++) {
    const dest = SAMPLE_DESTINATIONS[Math.floor(Math.random() * SAMPLE_DESTINATIONS.length)];
    // Add slight jitter to coordinates so they don't overlap completely
    const lat = dest.lat + (Math.random() - 0.5) * 0.02;
    const lng = dest.lng + (Math.random() - 0.5) * 0.02;
    const weight = Math.floor(Math.random() * 200) + 50; // 50 to 250 kg
    const pRand = Math.random();
    const priority = pRand > 0.8 ? 'HIGH' : pRand > 0.4 ? 'MEDIUM' : 'LOW';

    shipments.push({
      id: `SHP-10${i.toString().padStart(2, '0')}`,
      destinationName: dest.name,
      lat,
      lng,
      weight,
      priority,
      status: 'Unassigned',
      vehicleId: null,
      distanceToDepot: 0 // Will be calculated dynamically
    });
  }
  return shipments;
}

const INITIAL_SHIPMENTS = generateShipments();

class MockDataService {
  constructor() {
    this.vehicles = this._load('vehicles', INITIAL_VEHICLES);
    this.shipments = this._load('shipments', INITIAL_SHIPMENTS);
    this.optimizationState = this._load('opt_state', null); // Stores before/after routes
  }

  _load(key, fallback) {
    const data = localStorage.getItem(`fleetopt_${key}`);
    return data ? JSON.parse(data) : fallback;
  }

  _save() {
    localStorage.setItem('fleetopt_vehicles', JSON.stringify(this.vehicles));
    localStorage.setItem('fleetopt_shipments', JSON.stringify(this.shipments));
    localStorage.setItem('fleetopt_opt_state', JSON.stringify(this.optimizationState));
  }

  getVehicles() {
    return this.vehicles;
  }

  getShipments() {
    return this.shipments.map(s => {
      const v = this.vehicles.find(v => v.id === s.vehicleId);
      return { ...s, vehicleName: v ? v.name : 'Unassigned' };
    });
  }
  
  getOptimizationState() {
    return this.optimizationState;
  }

  saveOptimizationResult(vehicles, shipments, optState) {
    this.vehicles = vehicles;
    this.shipments = shipments;
    this.optimizationState = optState;
    this._save();
  }

  resetDemo() {
    this.vehicles = JSON.parse(JSON.stringify(INITIAL_VEHICLES));
    this.shipments = JSON.parse(JSON.stringify(INITIAL_SHIPMENTS));
    this.optimizationState = null;
    this._save();
  }

  getMetrics() {
    const totalCapacity = this.vehicles.reduce((sum, v) => sum + v.capacity, 0);
    const assignedLoad = this.vehicles.reduce((sum, v) => sum + v.currentLoad, 0);
    const util = totalCapacity > 0 ? (assignedLoad / totalCapacity) * 100 : 0;
    
    return {
      activeVehicles: this.vehicles.filter(v => v.currentLoad > 0).length,
      totalCapacity,
      assignedLoad,
      capacityUtilization: util.toFixed(1),
      activeShipments: this.shipments.length,
      unassignedShipments: this.shipments.filter(s => s.status === 'Unassigned').length,
      highPriority: this.shipments.filter(s => s.priority === 'HIGH').length,
    };
  }
}

export const api = new MockDataService();
