import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './LiveMap.css';

// Fix default marker icon issue with webpack/vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const defaultCenter = [12.9716, 77.5946]; // Bangalore

// Custom icons
const createIcon = (emoji, color) => {
  return L.divIcon({
    html: `<div style="
      background: ${color};
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      border: 3px solid white;
    ">${emoji}</div>`,
    className: 'custom-marker',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  });
};

const driverIcon = createIcon('🚚', '#3b82f6');
const restaurantIcon = createIcon('🍽️', '#f59e0b');
const customerIcon = createIcon('🏠', '#22c55e');

// Component to auto-fit map bounds when locations change
const FitBounds = ({ driverLocation, restaurantLocation, customerLocation, showPhase }) => {
  const map = useMap();

  useEffect(() => {
    const points = [];

    if (driverLocation?.length === 2) {
      points.push([driverLocation[1], driverLocation[0]]);
    }
    if (restaurantLocation?.length === 2 && (showPhase === 'all' || showPhase === 'pickup')) {
      points.push([restaurantLocation[1], restaurantLocation[0]]);
    }
    if (customerLocation?.length === 2 && (showPhase === 'all' || showPhase === 'delivery')) {
      points.push([customerLocation[1], customerLocation[0]]);
    }

    if (points.length >= 2) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (points.length === 1) {
      map.setView(points[0], 15);
    }
  }, [driverLocation, restaurantLocation, customerLocation, showPhase, map]);

  return null;
};

const LiveMap = ({
  driverLocation,
  restaurantLocation,
  customerLocation,
  customerName,
  restaurantName,
  height = '400px',
  showPhase = 'all'
}) => {
  // Build the route path based on phase
  const routePath = [];
  if (showPhase === 'pickup') {
    if (driverLocation?.length === 2)
      routePath.push([driverLocation[1], driverLocation[0]]);
    if (restaurantLocation?.length === 2)
      routePath.push([restaurantLocation[1], restaurantLocation[0]]);
  } else if (showPhase === 'delivery') {
    if (driverLocation?.length === 2)
      routePath.push([driverLocation[1], driverLocation[0]]);
    if (customerLocation?.length === 2)
      routePath.push([customerLocation[1], customerLocation[0]]);
  } else {
    if (restaurantLocation?.length === 2)
      routePath.push([restaurantLocation[1], restaurantLocation[0]]);
    if (driverLocation?.length === 2)
      routePath.push([driverLocation[1], driverLocation[0]]);
    if (customerLocation?.length === 2)
      routePath.push([customerLocation[1], customerLocation[0]]);
  }

  // Determine the center
  const center = driverLocation?.length === 2
    ? [driverLocation[1], driverLocation[0]]
    : defaultCenter;

  const routeColor = showPhase === 'pickup' ? '#f59e0b' : showPhase === 'delivery' ? '#22c55e' : '#e23744';

  return (
    <div className="live-map" style={{ height, borderRadius: '12px', overflow: 'hidden' }}>
      <MapContainer
        center={center}
        zoom={14}
        style={{ width: '100%', height: '100%' }}
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitBounds
          driverLocation={driverLocation}
          restaurantLocation={restaurantLocation}
          customerLocation={customerLocation}
          showPhase={showPhase}
        />

        {/* Driver Marker */}
        {driverLocation?.length === 2 && (
          <Marker position={[driverLocation[1], driverLocation[0]]} icon={driverIcon}>
            <Popup><strong>🚚 Driver</strong><br />Current Location</Popup>
          </Marker>
        )}

        {/* Restaurant Marker */}
        {restaurantLocation?.length === 2 && (
          <Marker position={[restaurantLocation[1], restaurantLocation[0]]} icon={restaurantIcon}>
            <Popup><strong>📍 Pickup</strong><br />{restaurantName || 'Restaurant'}</Popup>
          </Marker>
        )}

        {/* Customer Marker */}
        {customerLocation?.length === 2 && (
          <Marker position={[customerLocation[1], customerLocation[0]]} icon={customerIcon}>
            <Popup><strong>🏠 Drop-off</strong><br />{customerName || 'Customer'}</Popup>
          </Marker>
        )}

        {/* Route Line */}
        {routePath.length >= 2 && (
          <Polyline
            positions={routePath}
            pathOptions={{
              color: routeColor,
              weight: 4,
              opacity: 0.8,
              dashArray: '10, 10',
            }}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default LiveMap;
