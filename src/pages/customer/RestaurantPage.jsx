import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { FiArrowLeft, FiStar, FiClock, FiShoppingCart, FiMapPin, FiNavigation } from 'react-icons/fi';
import '../Dashboard.css';

const RestaurantPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [ordering, setOrdering] = useState(false);

  // Location & Address State
  const [gpsLocation, setGpsLocation] = useState(null); // [lng, lat]
  const [locatingGps, setLocatingGps] = useState(false);
  const [gpsError, setGpsError] = useState('');
  const [flatHouse, setFlatHouse] = useState('');
  const [landmark, setLandmark] = useState('');
  const [areaLocality, setAreaLocality] = useState('');
  const [city, setCity] = useState('Bangalore');
  const [pincode, setPincode] = useState('');

  useEffect(() => {
    fetchRestaurant();
    fetchMenu();
  }, [id]);

  const fetchRestaurant = async () => {
    try {
      const { data } = await api.get(`/restaurants/${id}`);
      setRestaurant(data);
    } catch (err) { console.error(err); }
  };

  const fetchMenu = async () => {
    try {
      const { data } = await api.get(`/restaurants/${id}/menu`);
      setMenuItems(data);
    } catch (err) { console.error(err); }
  };

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(c => c.menuItem === item._id);
      if (existing) {
        return prev.map(c => c.menuItem === item._id ? { ...c, quantity: c.quantity + 1 } : c);
      }
      return [...prev, { menuItem: item._id, name: item.name, price: item.price, quantity: 1 }];
    });
  };

  const updateQty = (menuItemId, delta) => {
    setCart(prev => prev
      .map(c => c.menuItem === menuItemId ? { ...c, quantity: c.quantity + delta } : c)
      .filter(c => c.quantity > 0)
    );
  };

  const total = cart.reduce((sum, c) => sum + c.price * c.quantity, 0);

  // GPS Location Capture
  const captureLocation = () => {
    setLocatingGps(true);
    setGpsError('');

    if (!navigator.geolocation) {
      setGpsError('Geolocation not supported by your browser');
      setLocatingGps(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.longitude, pos.coords.latitude];
        setGpsLocation(coords);
        setLocatingGps(false);

        // Reverse geocode to auto-fill area
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`)
          .then(r => r.json())
          .then(data => {
            if (data.address) {
              setAreaLocality(data.address.suburb || data.address.neighbourhood || data.address.county || '');
              setCity(data.address.city || data.address.town || data.address.state || 'Bangalore');
              setPincode(data.address.postcode || '');
            }
          })
          .catch(() => {});
      },
      (err) => {
        setGpsError('Unable to get location. Please enable location access in your browser settings.');
        setLocatingGps(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const fullAddress = [flatHouse, landmark, areaLocality, city, pincode].filter(Boolean).join(', ');

  const placeOrder = async () => {
    if (!gpsLocation) return alert('Please enable your location for delivery');
    if (!flatHouse.trim()) return alert('Please enter your flat/house number');
    if (cart.length === 0) return alert('Cart is empty');

    setOrdering(true);
    try {
      await api.post('/orders', {
        restaurantId: id,
        items: cart,
        totalAmount: total,
        deliveryAddress: fullAddress,
        customerLocation: {
          type: 'Point',
          coordinates: gpsLocation
        }
      });
      alert('Order placed successfully! 🎉');
      navigate('/customer');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to place order');
    }
    setOrdering(false);
  };

  if (!restaurant) return <div className="loading-screen"><div className="spinner"></div></div>;

  return (
    <div className="dashboard-layout">
      <header className="dashboard-header">
        <div className="dashboard-header-inner">
          <Link to="/" className="dashboard-logo">tomato</Link>
          <div className="dashboard-user-info">
            <button onClick={() => setShowCart(!showCart)} style={{ position: 'relative', background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer' }}>
              <FiShoppingCart />
              {cart.length > 0 && (
                <span style={{ position: 'absolute', top: '-6px', right: '-6px', background: 'var(--color-primary)', color: 'white', borderRadius: '50%', width: '18px', height: '18px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {cart.reduce((s, c) => s + c.quantity, 0)}
                </span>
              )}
            </button>
            <button className="dashboard-logout" onClick={() => { logout(); navigate('/'); }}>Logout</button>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="back-link" onClick={() => navigate('/customer')}>
          <FiArrowLeft /> Back to restaurants
        </div>

        {/* Restaurant Header */}
        <div className="menu-header">
          <div className="menu-header-img"><img src={restaurant.image} alt={restaurant.name} /></div>
          <div className="menu-header-info">
            <h1>{restaurant.name}</h1>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '8px' }}>{restaurant.cuisines?.join(', ')}</p>
            <p style={{ color: 'var(--color-text-light)', marginBottom: '8px' }}>{restaurant.address}</p>
            <div style={{ display: 'flex', gap: '16px' }}>
              <span className="rest-rating"><FiStar /> {restaurant.rating || '4.0'}</span>
              <span style={{ color: 'var(--color-text-muted)' }}><FiClock /> {restaurant.deliveryTime}</span>
              <span style={{ color: 'var(--color-text-muted)' }}>₹{restaurant.costForTwo} for two</span>
            </div>
          </div>
        </div>

        {/* Menu */}
        <h2 style={{ marginBottom: '16px' }}>Menu</h2>
        {menuItems.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">📋</div><p>No menu items yet</p></div>
        ) : (
          <div className="menu-grid">
            {menuItems.map(item => (
              <div key={item._id} className="menu-item-card">
                <div className="menu-item-img"><img src={item.image} alt={item.name} /></div>
                <div className="menu-item-info">
                  <h4><span className={`veg-badge ${item.isVeg ? 'veg' : 'non-veg'}`}></span>{item.name}</h4>
                  <div className="price">₹{item.price}</div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)' }}>{item.description}</p>
                  <button className="add-to-cart-btn" onClick={() => addToCart(item)}>ADD</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Cart + Checkout */}
        {showCart && cart.length > 0 && (
          <div className="cart-section">
            <h2 style={{ marginBottom: '16px' }}>Your Cart</h2>
            <div className="cart-items">
              {cart.map(item => (
                <div key={item.menuItem} className="cart-item">
                  <span>{item.name}</span>
                  <div className="cart-item-qty">
                    <button className="qty-btn" onClick={() => updateQty(item.menuItem, -1)}>−</button>
                    <span>{item.quantity}</span>
                    
                    <button className="qty-btn" onClick={() => updateQty(item.menuItem, 1)}>+</button>
                    <span style={{ fontWeight: 600 }}>₹{item.price * item.quantity}</span>
                  </div>
                </div>
              ))}
              <div className="cart-total">
                <span>Total</span>
                <span>₹{total}</span>
              </div>
            </div>

            {/* ===== DELIVERY LOCATION ===== */}
            <div style={{ marginTop: '20px', background: 'white', borderRadius: '12px', border: '1px solid var(--color-border)', padding: '20px' }}>
              <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiMapPin /> Delivery Location
              </h3>

              {/* GPS Capture Button */}
              {!gpsLocation ? (
                <div style={{ marginBottom: '16px' }}>
                  <button
                    onClick={captureLocation}
                    disabled={locatingGps}
                    style={{
                      width: '100%',
                      padding: '14px',
                      border: '2px dashed #22c55e',
                      borderRadius: '10px',
                      background: '#f0fdf4',
                      color: '#166534',
                      fontWeight: 600,
                      fontSize: '1rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.2s'
                    }}
                  >
                    {locatingGps ? (
                      <>
                        <div className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }}></div>
                        Locating you...
                      </>
                    ) : (
                      <>
                        <FiNavigation size={18} />
                        📍 Enable Location (Required)
                      </>
                    )}
                  </button>
                  {gpsError && (
                    <div style={{ color: '#dc2626', fontSize: '0.85rem', marginTop: '8px' }}>{gpsError}</div>
                  )}
                </div>
              ) : (
                <div style={{ marginBottom: '16px', padding: '12px 16px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.2rem' }}>✅</span>
                  <div>
                    <div style={{ fontWeight: 600, color: '#166534' }}>Location captured!</div>
                    <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                      {gpsLocation[1].toFixed(4)}, {gpsLocation[0].toFixed(4)}
                    </div>
                  </div>
                  <button onClick={captureLocation} style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                    Recapture
                  </button>
                </div>
              )}

              {/* Detailed Address Fields */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-group">
                  <label>Flat / House No. / Building *</label>
                  <input
                    type="text"
                    value={flatHouse}
                    onChange={(e) => setFlatHouse(e.target.value)}
                    placeholder="e.g. Flat 302, Tower B, Sunrise Apartments"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Landmark</label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="e.g. Near Big Bazaar, Opposite Metro Station"
                  />
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Area / Locality</label>
                    <input
                      type="text"
                      value={areaLocality}
                      onChange={(e) => setAreaLocality(e.target.value)}
                      placeholder="e.g. Koramangala"
                    />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Bangalore"
                    />
                  </div>
                  <div className="form-group" style={{ flex: 0.6 }}>
                    <label>Pincode</label>
                    <input
                      type="text"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="560001"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button className="checkout-btn" style={{ marginTop: '16px' }} onClick={placeOrder} disabled={ordering || !gpsLocation}>
              {ordering ? 'Placing Order...' : !gpsLocation ? '📍 Enable Location to Order' : `Place Order — ₹${total}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantPage;
