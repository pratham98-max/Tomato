import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { FiStar, FiClock, FiShoppingBag, FiPackage, FiMapPin, FiNavigation } from 'react-icons/fi';
import '../Dashboard.css';

const CustomerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState('restaurants');
  const [userLocation, setUserLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('detecting'); // 'detecting' | 'granted' | 'denied'
  const [locationName, setLocationName] = useState('');

  // Get user's location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(loc);
          setLocationStatus('granted');

          // Reverse geocode to get area name
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${loc.lat}&lon=${loc.lng}`)
            .then(r => r.json())
            .then(data => {
              const area = data.address?.suburb || data.address?.neighbourhood || data.address?.city_district || data.address?.city || '';
              setLocationName(area);
            })
            .catch(() => {});
        },
        (err) => {
          console.warn('Location denied:', err.message);
          setLocationStatus('denied');
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setLocationStatus('denied');
    }
  }, []);

  // Fetch restaurants whenever location changes
  useEffect(() => {
    if (locationStatus === 'detecting') return; // still waiting
    fetchRestaurants();
  }, [userLocation, locationStatus]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchRestaurants = async () => {
    try {
      let url = '/restaurants';
      if (userLocation) {
        url += `?lat=${userLocation.lat}&lng=${userLocation.lng}&radius=15`;
      }
      const { data } = await api.get(url);
      setRestaurants(data);
    } catch (err) { console.error(err); }
  };

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders');
      setOrders(data);
    } catch (err) { console.error(err); }
  };

  const showAllRestaurants = async () => {
    try {
      const { data } = await api.get('/restaurants');
      setRestaurants(data);
      setLocationStatus('denied'); // switch to "showing all" mode
      setLocationName('');
    } catch (err) { console.error(err); }
  };

  const activeOrders = orders.filter(o => !['delivered', 'cancelled'].includes(o.status));

  return (
    <div className="dashboard-layout">
      <header className="dashboard-header">
        <div className="dashboard-header-inner">
          <Link to="/" className="dashboard-logo">tomato</Link>
          <div className="dashboard-user-info">
            <span className={`dashboard-role-badge ${user.role}`}>{user.role}</span>
            <span>{user.name}</span>
            <button className="dashboard-logout" onClick={() => { logout(); navigate('/'); }}>Logout</button>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        {/* Location Banner */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 16px',
          marginBottom: '20px',
          background: locationStatus === 'granted' ? 'rgba(34, 197, 94, 0.08)' : 'rgba(245, 158, 11, 0.08)',
          borderRadius: '10px',
          border: `1px solid ${locationStatus === 'granted' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`,
          fontSize: '0.9rem',
          color: 'var(--color-text-muted)',
          flexWrap: 'wrap'
        }}>
          <FiMapPin style={{ color: locationStatus === 'granted' ? '#22c55e' : '#f59e0b', flexShrink: 0 }} />
          {locationStatus === 'detecting' && <span>📡 Detecting your location...</span>}
          {locationStatus === 'granted' && (
            <>
              <span>Showing restaurants near <strong style={{ color: 'var(--color-text)' }}>{locationName || 'your location'}</strong> (within 15 km)</span>
              <button
                onClick={showAllRestaurants}
                style={{
                  marginLeft: 'auto',
                  background: 'none',
                  border: '1px solid var(--color-border)',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  color: 'var(--color-primary)',
                  fontWeight: 500
                }}
              >
                Show all
              </button>
            </>
          )}
          {locationStatus === 'denied' && (
            <span>📍 Showing all restaurants. <em>Enable location to see nearby ones.</em></span>
          )}
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon red"><FiShoppingBag /></div>
            <div><div className="stat-value">{orders.length}</div><div className="stat-label">Total Orders</div></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon blue"><FiPackage /></div>
            <div><div className="stat-value">{activeOrders.length}</div><div className="stat-label">Active Orders</div></div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <button className={`filter-btn ${tab === 'restaurants' ? 'active' : ''}`} onClick={() => setTab('restaurants')} style={tab === 'restaurants' ? { background: 'var(--color-primary)', color: 'white', border: 'none' } : {}}>
            Browse Restaurants
          </button>
          <button className={`filter-btn ${tab === 'orders' ? 'active' : ''}`} onClick={() => setTab('orders')} style={tab === 'orders' ? { background: 'var(--color-primary)', color: 'white', border: 'none' } : {}}>
            My Orders
          </button>
        </div>

        {tab === 'restaurants' && (
          <div className="restaurant-list">
            {locationStatus === 'detecting' ? (
              <div className="empty-state"><div className="empty-icon">📡</div><p>Detecting your location...</p></div>
            ) : restaurants.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🍽️</div>
                <p>No restaurants found nearby</p>
                {userLocation && (
                  <button
                    onClick={showAllRestaurants}
                    style={{
                      marginTop: '12px',
                      padding: '8px 20px',
                      background: 'var(--color-primary)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 500
                    }}
                  >
                    Show all restaurants
                  </button>
                )}
              </div>
            ) : (
              restaurants.map(r => (
                <div key={r._id} className="rest-card" onClick={() => navigate(`/customer/restaurant/${r._id}`)}>
                  <div className="rest-card-img"><img src={r.image} alt={r.name} /></div>
                  <div className="rest-card-info">
                    <h3>{r.name}</h3>
                    <div className="rest-card-meta">
                      <span className="rest-rating"><FiStar /> {r.rating || '4.0'}</span>
                      <span><FiClock /> {r.deliveryTime}</span>
                    </div>
                    <div className="rest-cuisines">{r.cuisines?.join(', ')}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', marginTop: '4px' }}>₹{r.costForTwo} for two</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'orders' && (
          <div className="order-list">
            {orders.length === 0 ? (
              <div className="empty-state"><div className="empty-icon">📦</div><p>No orders yet</p></div>
            ) : (
              orders.map(o => (
                <div key={o._id} className="order-card" onClick={() => !['delivered', 'cancelled'].includes(o.status) && navigate(`/customer/track/${o._id}`)}>
                  <div className="order-card-header">
                    <span className="order-id">#{o._id.slice(-6)}</span>
                    <span className={`order-status ${o.status}`}>{o.status.replace(/_/g, ' ')}</span>
                  </div>
                  <div className="order-restaurant">{o.restaurant?.name || 'Restaurant'}</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                    {o.items?.map(i => `${i.name} x${i.quantity}`).join(', ')}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                    <span className="order-amount">₹{o.totalAmount}</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-light)' }}>{new Date(o.createdAt).toLocaleDateString()}</span>
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

export default CustomerDashboard;

