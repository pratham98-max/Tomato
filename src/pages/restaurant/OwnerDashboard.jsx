import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import api from '../../utils/api';
import { FiPlus, FiEdit2, FiTrash2, FiShoppingBag, FiDollarSign, FiPackage, FiCheckCircle } from 'react-icons/fi';
import '../Dashboard.css';

const OwnerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const socket = useSocket();
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState('orders');
  const [showModal, setShowModal] = useState(false);
  const [showRestModal, setShowRestModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', price: '', category: 'Main Course', isVeg: false, image: '' });
  const [restForm, setRestForm] = useState({ name: '', address: '', cuisines: '', description: '', deliveryTime: '30-40 min', costForTwo: 500, image: '' });

  useEffect(() => {
    fetchRestaurant();
    fetchOrders();
  }, []);

  useEffect(() => {
    if (!socket || !restaurant) return;
    socket.emit('joinRestaurant', restaurant._id);
    socket.on('newOrder', () => fetchOrders());
    socket.on('orderStatusUpdate', () => fetchOrders());
    return () => {
      socket.off('newOrder');
      socket.off('orderStatusUpdate');
    };
  }, [socket, restaurant]);

  const fetchRestaurant = async () => {
    try {
      const { data } = await api.get('/restaurants/my');
      setRestaurant(data);
      fetchMenu(data._id);
    } catch (err) {
      setRestaurant(null);
    }
  };

  const fetchMenu = async (id) => {
    try {
      const { data } = await api.get(`/restaurants/${id}/menu`);
      setMenuItems(data);
    } catch (err) { console.error(err); }
  };

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders');
      setOrders(data);
    } catch (err) { console.error(err); }
  };

  const createRestaurant = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/restaurants', {
        ...restForm,
        cuisines: restForm.cuisines.split(',').map(c => c.trim()).filter(Boolean)
      });
      setRestaurant(data);
      setShowRestModal(false);
    } catch (err) { alert(err.response?.data?.message || 'Failed'); }
  };

  const saveMenuItem = async (e) => {
    e.preventDefault();
    try {
      if (editItem) {
        await api.put(`/restaurants/${restaurant._id}/menu/${editItem._id}`, { ...formData, price: Number(formData.price) });
      } else {
        await api.post(`/restaurants/${restaurant._id}/menu`, { ...formData, price: Number(formData.price) });
      }
      setShowModal(false);
      setEditItem(null);
      setFormData({ name: '', description: '', price: '', category: 'Main Course', isVeg: false, image: '' });
      fetchMenu(restaurant._id);
    } catch (err) { alert(err.response?.data?.message || 'Failed'); }
  };

  const deleteItem = async (itemId) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      await api.delete(`/restaurants/${restaurant._id}/menu/${itemId}`);
      fetchMenu(restaurant._id);
    } catch (err) { alert('Failed to delete'); }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      fetchOrders();
    } catch (err) { alert('Failed'); }
  };

  const openEdit = (item) => {
    setEditItem(item);
    setFormData({ name: item.name, description: item.description, price: item.price, category: item.category, isVeg: item.isVeg, image: item.image });
    setShowModal(true);
  };

  const revenue = orders.filter(o => o.status === 'delivered').reduce((s, o) => s + o.totalAmount, 0);
  const activeOrders = orders.filter(o => !['delivered', 'cancelled'].includes(o.status));

  if (!restaurant) {
    return (
      <div className="dashboard-layout">
        <header className="dashboard-header"><div className="dashboard-header-inner"><Link to="/" className="dashboard-logo">tomato</Link><div className="dashboard-user-info"><button className="dashboard-logout" onClick={() => { logout(); navigate('/'); }}>Logout</button></div></div></header>
        <div className="dashboard-content">
          <div className="empty-state">
            <div className="empty-icon">🏪</div>
            <h2>Set Up Your Restaurant</h2>
            <p style={{ marginBottom: '20px' }}>Create your restaurant to start receiving orders</p>
            <button className="add-btn" onClick={() => setShowRestModal(true)}><FiPlus /> Create Restaurant</button>
          </div>
          {showRestModal && (
            <div className="modal-overlay" onClick={() => setShowRestModal(false)}>
              <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h3>Create Restaurant</h3>
                <form onSubmit={createRestaurant} className="auth-form">
                  <div className="form-group"><label>Restaurant Name</label><input type="text" value={restForm.name} onChange={e => setRestForm({...restForm, name: e.target.value})} required /></div>
                  <div className="form-group"><label>Address</label><input type="text" value={restForm.address} onChange={e => setRestForm({...restForm, address: e.target.value})} required /></div>
                  <div className="form-group"><label>Cuisines (comma separated)</label><input type="text" value={restForm.cuisines} onChange={e => setRestForm({...restForm, cuisines: e.target.value})} placeholder="Italian, Pizza, Pasta" /></div>
                  <div className="form-group"><label>Description</label><input type="text" value={restForm.description} onChange={e => setRestForm({...restForm, description: e.target.value})} /></div>
                  <div className="form-row">
                    <div className="form-group"><label>Delivery Time</label><input type="text" value={restForm.deliveryTime} onChange={e => setRestForm({...restForm, deliveryTime: e.target.value})} /></div>
                    <div className="form-group"><label>Cost for Two (₹)</label><input type="number" value={restForm.costForTwo} onChange={e => setRestForm({...restForm, costForTwo: Number(e.target.value)})} /></div>
                  </div>
                  <div className="form-group"><label>Image URL</label><input type="text" value={restForm.image} onChange={e => setRestForm({...restForm, image: e.target.value})} placeholder="https://..." /></div>
                  <div className="modal-actions"><button type="submit" className="btn-save">Create</button><button type="button" className="btn-cancel" onClick={() => setShowRestModal(false)}>Cancel</button></div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <header className="dashboard-header">
        <div className="dashboard-header-inner">
          <Link to="/" className="dashboard-logo">tomato</Link>
          <div className="dashboard-user-info">
            <span className="dashboard-role-badge restaurant">Restaurant</span>
            <span>{restaurant.name}</span>
            <button className="dashboard-logout" onClick={() => { logout(); navigate('/'); }}>Logout</button>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card"><div className="stat-icon red"><FiShoppingBag /></div><div><div className="stat-value">{orders.length}</div><div className="stat-label">Total Orders</div></div></div>
          <div className="stat-card"><div className="stat-icon blue"><FiPackage /></div><div><div className="stat-value">{activeOrders.length}</div><div className="stat-label">Active Orders</div></div></div>
          <div className="stat-card"><div className="stat-icon green"><FiDollarSign /></div><div><div className="stat-value">₹{revenue}</div><div className="stat-label">Revenue</div></div></div>
          <div className="stat-card"><div className="stat-icon orange"><FiCheckCircle /></div><div><div className="stat-value">{menuItems.length}</div><div className="stat-label">Menu Items</div></div></div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          {['orders', 'menu'].map(t => (
            <button key={t} className="filter-btn" onClick={() => setTab(t)} style={tab === t ? { background: 'var(--color-primary)', color: 'white', border: 'none' } : {}}>
              {t === 'orders' ? 'Orders' : 'Menu Manager'}
            </button>
          ))}
        </div>

        {tab === 'orders' && (
          <div className="order-list">
            {orders.length === 0 ? <div className="empty-state"><div className="empty-icon">📦</div><p>No orders yet</p></div> : (
              orders.map(o => (
                <div key={o._id} className="order-card">
                  <div className="order-card-header">
                    <span className="order-id">#{o._id.slice(-6)} — {o.customer?.name}</span>
                    <span className={`order-status ${o.status}`}>{o.status.replace(/_/g, ' ')}</span>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                    {o.items?.map(i => `${i.name} x${i.quantity}`).join(', ')}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                    <span className="order-amount">₹{o.totalAmount}</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-light)' }}>{o.deliveryAddress}</span>
                  </div>
                  {!['delivered', 'cancelled'].includes(o.status) && (
                    <div className="status-actions">
                      {o.status === 'placed' && <button className="status-btn" onClick={() => updateOrderStatus(o._id, 'confirmed')}>✓ Confirm</button>}
                      {o.status === 'confirmed' && <button className="status-btn" onClick={() => updateOrderStatus(o._id, 'preparing')}>🍳 Start Preparing</button>}
                      {o.status === 'preparing' && <button className="status-btn" onClick={() => updateOrderStatus(o._id, 'ready')}>✅ Ready for Pickup</button>}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'menu' && (
          <>
            <div className="section-header">
              <h2>Menu Items</h2>
              <button className="add-btn" onClick={() => { setEditItem(null); setFormData({ name: '', description: '', price: '', category: 'Main Course', isVeg: false, image: '' }); setShowModal(true); }}><FiPlus /> Add Item</button>
            </div>
            <div className="manager-grid">
              {menuItems.map(item => (
                <div key={item._id} className="manager-item">
                  <div className="manager-item-img"><img src={item.image} alt={item.name} /></div>
                  <div style={{ flex: 1 }}>
                    <h4><span className={`veg-badge ${item.isVeg ? 'veg' : 'non-veg'}`}></span>{item.name}</h4>
                    <div style={{ fontWeight: 600, marginBottom: '4px' }}>₹{item.price}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-light)' }}>{item.category}</div>
                    <div className="manager-item-actions">
                      <button className="btn-sm edit" onClick={() => openEdit(item)}><FiEdit2 /> Edit</button>
                      <button className="btn-sm delete" onClick={() => deleteItem(item._id)}><FiTrash2 /> Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Menu Item Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <h3>{editItem ? 'Edit Item' : 'Add Menu Item'}</h3>
              <form onSubmit={saveMenuItem} className="auth-form">
                <div className="form-group"><label>Item Name</label><input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required /></div>
                <div className="form-group"><label>Description</label><input type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} /></div>
                <div className="form-row">
                  <div className="form-group"><label>Price (₹)</label><input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required /></div>
                  <div className="form-group"><label>Category</label><input type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} /></div>
                </div>
                <div className="form-group"><label>Image URL</label><input type="text" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} placeholder="https://..." /></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" id="isVeg" checked={formData.isVeg} onChange={e => setFormData({...formData, isVeg: e.target.checked})} />
                  <label htmlFor="isVeg">Vegetarian</label>
                </div>
                <div className="modal-actions"><button type="submit" className="btn-save">{editItem ? 'Update' : 'Add Item'}</button><button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button></div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerDashboard;
