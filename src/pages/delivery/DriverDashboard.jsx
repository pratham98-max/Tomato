import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import api from '../../utils/api';
import LiveMap from '../../components/LiveMap';
import { FiTruck, FiMapPin, FiDollarSign, FiCheckCircle, FiPhone, FiUser, FiNavigation } from 'react-icons/fi';
import '../Dashboard.css';

const DriverDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const socket = useSocket();
  const [availableOrders, setAvailableOrders] = useState([]);
  const [activeDeliveries, setActiveDeliveries] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [tab, setTab] = useState('available');
  const [driverLocation, setDriverLocation] = useState([77.5946, 12.9716]);
  const [trackingActive, setTrackingActive] = useState(false);

  useEffect(() => {
    fetchAvailable();
    fetchActive();
    fetchCompleted();
  }, []);

  const fetchAvailable = async () => {
    try {
      const { data } = await api.get('/delivery/available');
      setAvailableOrders(data);
    } catch (err) { console.error(err); }
  };

  const fetchActive = async () => {
    try {
      const { data } = await api.get('/delivery/my');
      setActiveDeliveries(data);
    } catch (err) { console.error(err); }
  };

  const fetchCompleted = async () => {
    try {
      const { data } = await api.get('/orders');
      setCompletedOrders(data.filter(o => o.status === 'delivered'));
    } catch (err) { console.error(err); }
  };

  const acceptDelivery = async (orderId) => {
    try {
      await api.put(`/delivery/${orderId}/accept`);
      fetchAvailable();
      fetchActive();
      setTab('active');
    } catch (err) { alert(err.response?.data?.message || 'Failed'); }
  };

  const markDelivered = async (orderId) => {
    try {
      await api.put(`/delivery/${orderId}/deliver`);
      setTrackingActive(false);
      fetchActive();
      fetchCompleted();
    } catch (err) { alert('Failed'); }
  };

  const startTracking = useCallback((orderId) => {
    setTrackingActive(true);
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        (pos) => {
          const coords = [pos.coords.longitude, pos.coords.latitude];
          setDriverLocation(coords);
          api.put(`/delivery/${orderId}/location`, { coordinates: coords }).catch(console.error);
          if (socket) socket.emit('driverLocationUpdate', { orderId, coordinates: coords });
        },
        () => simulateMovement(orderId),
        { enableHighAccuracy: true, maximumAge: 5000 }
      );
    } else {
      simulateMovement(orderId);
    }
  }, [socket]);

  const simulateMovement = (orderId) => {
    let lng = 77.5946 + (Math.random() - 0.5) * 0.02;
    let lat = 12.9716 + (Math.random() - 0.5) * 0.02;
    setInterval(() => {
      lng += (Math.random() - 0.3) * 0.002;
      lat += (Math.random() - 0.3) * 0.002;
      const coords = [lng, lat];
      setDriverLocation(coords);
      api.put(`/delivery/${orderId}/location`, { coordinates: coords }).catch(console.error);
      if (socket) socket.emit('driverLocationUpdate', { orderId, coordinates: coords });
    }, 3000);
  };

  const earnings = completedOrders.reduce((s, o) => s + Math.round(o.totalAmount * 0.15), 0);

  return (
    <div className="dashboard-layout">
      <header className="dashboard-header">
        <div className="dashboard-header-inner">
          <Link to="/" className="dashboard-logo">tomato</Link>
          <div className="dashboard-user-info">
            <span className="dashboard-role-badge delivery">Delivery</span>
            <span>{user.name}</span>
            <button className="dashboard-logout" onClick={() => { logout(); navigate('/'); }}>Logout</button>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="stats-grid">
          <div className="stat-card"><div className="stat-icon green"><FiTruck /></div><div><div className="stat-value">{activeDeliveries.length}</div><div className="stat-label">Active Deliveries</div></div></div>
          <div className="stat-card"><div className="stat-icon blue"><FiCheckCircle /></div><div><div className="stat-value">{completedOrders.length}</div><div className="stat-label">Completed</div></div></div>
          <div className="stat-card"><div className="stat-icon orange"><FiDollarSign /></div><div><div className="stat-value">₹{earnings}</div><div className="stat-label">Earnings</div></div></div>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          {['available', 'active'].map(t => (
            <button key={t} className="filter-btn" onClick={() => setTab(t)} style={tab === t ? { background: 'var(--color-primary)', color: 'white', border: 'none' } : {}}>
              {t === 'available' ? `Available (${availableOrders.length})` : `Active (${activeDeliveries.length})`}
            </button>
          ))}
        </div>

        {/* ---- AVAILABLE ORDERS ---- */}
        {tab === 'available' && (
          <div>
            {availableOrders.length === 0 ? (
              <div className="empty-state"><div className="empty-icon">🚚</div><p>No deliveries available right now</p></div>
            ) : (
              availableOrders.map(o => (
                <div key={o._id} className="delivery-card">
                  <div className="delivery-card-header">
                    <div>
                      <div className="order-restaurant">{o.restaurant?.name}</div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}><FiMapPin /> {o.restaurant?.address}</div>
                    </div>
                    <span className="order-amount">₹{o.totalAmount}</span>
                  </div>

                  {/* Customer Delivery Info */}
                  <div style={{ background: '#f0fdf4', borderRadius: '8px', padding: '12px 16px', margin: '12px 0', borderLeft: '4px solid #22c55e' }}>
                    <div style={{ fontWeight: 600, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FiNavigation /> Deliver To
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <FiUser size={14} /> <strong>{o.customer?.name}</strong>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <FiMapPin size={14} /> {o.deliveryAddress || o.customer?.address || 'No address'}
                    </div>
                    {o.customer?.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FiPhone size={14} /> {o.customer.phone}
                      </div>
                    )}
                  </div>

                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', marginBottom: '12px' }}>
                    {o.items?.map(i => `${i.name} x${i.quantity}`).join(', ')}
                  </div>

                  {/* Mini map preview */}
                  {(o.restaurant?.location?.coordinates || o.customerLocation?.coordinates) && (
                    <LiveMap
                      restaurantLocation={o.restaurant?.location?.coordinates}
                      customerLocation={o.customerLocation?.coordinates}
                      restaurantName={o.restaurant?.name}
                      customerName={o.customer?.name}
                      height="200px"
                    />
                  )}

                  <button className="accept-btn" style={{ marginTop: '12px' }} onClick={() => acceptDelivery(o._id)}>
                    🛵 Accept Delivery
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* ---- ACTIVE DELIVERIES ---- */}
        {tab === 'active' && (
          <div>
            {activeDeliveries.length === 0 ? (
              <div className="empty-state"><div className="empty-icon">📦</div><p>No active deliveries</p></div>
            ) : (
              activeDeliveries.map(o => (
                <div key={o._id} className="dash-card" style={{ marginBottom: '20px' }}>
                  {/* Order header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div>
                      <h3 style={{ margin: 0 }}>{o.restaurant?.name}</h3>
                      <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                        <FiMapPin /> Pickup: {o.restaurant?.address}
                      </div>
                    </div>
                    <span className="order-amount">₹{o.totalAmount}</span>
                  </div>

                  {/* Customer Info Card */}
                  <div style={{
                    background: 'linear-gradient(135deg, #ecfdf5, #f0fdf4)',
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '16px',
                    border: '1px solid #bbf7d0'
                  }}>
                    <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '8px', color: '#166534', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FiNavigation /> Deliver to Customer
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem' }}>
                        <FiUser /> <strong>{o.customer?.name}</strong>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem' }}>
                        <FiMapPin /> {o.deliveryAddress || o.customer?.address || 'No address provided'}
                      </div>
                      {o.customer?.phone && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <FiPhone />
                          <a href={`tel:${o.customer.phone}`} style={{ color: '#166534', fontWeight: 600, textDecoration: 'none' }}>
                            {o.customer.phone} — Tap to call
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Items */}
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '12px' }}>
                    <strong>Items:</strong> {o.items?.map(i => `${i.name} x${i.quantity}`).join(', ')}
                  </div>

                  {/* Live Map with route */}
                  <LiveMap
                    driverLocation={driverLocation}
                    restaurantLocation={o.restaurant?.location?.coordinates}
                    customerLocation={o.customerLocation?.coordinates}
                    restaurantName={o.restaurant?.name}
                    customerName={o.customer?.name}
                    height="350px"
                  />

                  {/* Map Legend */}
                  <div style={{ display: 'flex', gap: '16px', margin: '10px 0', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    <span>🚚 You</span>
                    <span>📍 Restaurant</span>
                    <span>🏠 Customer</span>
                    <span style={{ color: '#e23744' }}>--- Route</span>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                    {!trackingActive && (
                      <button className="accept-btn" onClick={() => startTracking(o._id)}>
                        📍 Start GPS Tracking
                      </button>
                    )}
                    {trackingActive && (
                      <span style={{ color: '#22c55e', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="pulse-dot"></span> Sharing location live...
                      </span>
                    )}
                    <button className="deliver-btn" onClick={() => markDelivered(o._id)}>
                      ✓ Mark as Delivered
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverDashboard;
