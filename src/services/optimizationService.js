import { DEPOT_LOCATION } from './mockData';

// Haversine formula to calculate distance between two coordinates in km
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export function generateBaseline(vehicles, shipments) {
  // Naive Assignment: round robin sequentially without considering distance.
  const bVehicles = JSON.parse(JSON.stringify(vehicles));
  const bShipments = JSON.parse(JSON.stringify(shipments));
  let vIndex = 0;
  let totalDistance = 0;

  bVehicles.forEach(v => { v.currentLoad = 0; v.route = [DEPOT_LOCATION]; });

  bShipments.forEach(s => {
    let assigned = false;
    let attempts = 0;
    
    // Find first vehicle with capacity (starting from vIndex)
    while (attempts < bVehicles.length && !assigned) {
      let v = bVehicles[vIndex];
      if (v.currentLoad + s.weight <= v.capacity) {
        v.currentLoad += s.weight;
        s.vehicleId = v.id;
        s.status = 'Assigned';
        v.route.push({ lat: s.lat, lng: s.lng, shipmentId: s.id });
        assigned = true;
      }
      vIndex = (vIndex + 1) % bVehicles.length;
      attempts++;
    }
  });

  // Calculate naive route distances (Depot -> A -> B -> Depot)
  bVehicles.forEach(v => {
    if (v.route.length > 1) {
      let routeDist = 0;
      for (let i = 0; i < v.route.length - 1; i++) {
        routeDist += calculateDistance(v.route[i].lat, v.route[i].lng, v.route[i+1].lat, v.route[i+1].lng);
      }
      // Return to depot
      const lastNode = v.route[v.route.length - 1];
      routeDist += calculateDistance(lastNode.lat, lastNode.lng, DEPOT_LOCATION.lat, DEPOT_LOCATION.lng);
      v.route.push(DEPOT_LOCATION);
      v.routeDistance = routeDist;
      totalDistance += routeDist;
      v.status = 'In Transit';
    } else {
      v.routeDistance = 0;
    }
  });

  return { vehicles: bVehicles, shipments: bShipments, totalDistance };
}

export function optimizeRoutes(vehicles, shipments) {
  // Capacitated Vehicle Routing Problem (CVRP) Nearest Neighbor Heuristic
  // 1. Sort shipments by Priority (HIGH > MEDIUM > LOW)
  const priorityWeight = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
  
  const oVehicles = JSON.parse(JSON.stringify(vehicles));
  const oShipments = JSON.parse(JSON.stringify(shipments));
  
  oVehicles.forEach(v => { v.currentLoad = 0; v.route = [DEPOT_LOCATION]; v.currentPos = DEPOT_LOCATION; });

  let unassigned = oShipments.sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority]);
  let totalDistance = 0;

  // For each vehicle, build a route by finding the nearest feasible unassigned shipment
  oVehicles.forEach(v => {
    let routeActive = true;
    while (routeActive) {
      let bestShipmentIndex = -1;
      let minDistance = Infinity;

      for (let i = 0; i < unassigned.length; i++) {
        const s = unassigned[i];
        if (s.status === 'Assigned') continue;

        if (v.currentLoad + s.weight <= v.capacity) {
          const dist = calculateDistance(v.currentPos.lat, v.currentPos.lng, s.lat, s.lng);
          if (dist < minDistance) {
            minDistance = dist;
            bestShipmentIndex = i;
          }
        }
      }

      if (bestShipmentIndex !== -1) {
        const s = unassigned[bestShipmentIndex];
        s.vehicleId = v.id;
        s.status = 'Assigned';
        v.currentLoad += s.weight;
        v.route.push({ lat: s.lat, lng: s.lng, shipmentId: s.id });
        v.currentPos = { lat: s.lat, lng: s.lng };
      } else {
        routeActive = false; // No more feasible shipments for this vehicle
      }
    }
  });

  // Calculate optimized route distances
  oVehicles.forEach(v => {
    if (v.route.length > 1) {
      let routeDist = 0;
      for (let i = 0; i < v.route.length - 1; i++) {
        routeDist += calculateDistance(v.route[i].lat, v.route[i].lng, v.route[i+1].lat, v.route[i+1].lng);
      }
      const lastNode = v.route[v.route.length - 1];
      routeDist += calculateDistance(lastNode.lat, lastNode.lng, DEPOT_LOCATION.lat, DEPOT_LOCATION.lng);
      v.route.push(DEPOT_LOCATION);
      v.routeDistance = routeDist;
      totalDistance += routeDist;
      v.status = 'Optimized';
    } else {
      v.routeDistance = 0;
    }
  });

  return { vehicles: oVehicles, shipments: oShipments, totalDistance };
}
