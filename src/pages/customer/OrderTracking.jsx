import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import api from '../../utils/api';
import LiveMap from '../../components/LiveMap';
import OrderStatusTimeline from '../../components/OrderStatusTimeline';
import { FiArrowLeft, FiPhone, FiMapPin } from 'react-icons/fi';
import '../Dashboard.css';

const OrderTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const socket = useSocket();
  const [order, setOrder] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  useEffect(() => {
    if (!socket || !orderId) return;

    socket.emit('joinOrder', orderId);

    socket.on('orderStatusUpdate', (updatedOrder) => {
      setOrder(updatedOrder);
    });

    socket.on('locationUpdate', (data) => {
      if (data.orderId === orderId) {
        setDriverLocation(data.coordinates);
      }
    });

    return () => {
      socket.emit('leaveOrder', orderId);
      socket.off('orderStatusUpdate');
      socket.off('locationUpdate');
    };
  }, [socket, orderId]);

  const fetchOrder = async () => {
    try {
      const { data } = await api.get(`/orders/${orderId}`);
      setOrder(data);
      if (data.deliveryLocation?.coordinates) {
        setDriverLocation(data.deliveryLocation.coordinates);
      }
    } catch (err) { console.error(err); }
  };

  if (!order) return <div className="loading-screen"><div className="spinner"></div></div>;

  return (
    <div className="dashboard-layout">
      <header className="dashboard-header">
        <div className="dashboard-header-inner">
          <Link to="/" className="dashboard-logo">tomato</Link>
          <div className="dashboard-user-info">
            <span>{user.name}</span>
            <button className="dashboard-logout" onClick={() => { logout(); navigate('/'); }}>Logout</button>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="back-link" onClick={() => navigate('/customer')}>
          <FiArrowLeft /> Back to Orders
        </div>

        <h2 style={{ marginBottom: '4px' }}>Order #{order._id.slice(-6)}</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px' }}>
          {order.restaurant?.name || 'Restaurant'}
        </p>

        {/* Status Timeline */}
        <div className="dash-card" style={{ marginBottom: '24px' }}>
          <OrderStatusTimeline currentStatus={order.status} />
        </div>

        <div className="tracking-layout">
          {/* Live Map */}
          <div>
            <div className="dash-card">
              <h3>Live Tracking</h3>
              <LiveMap
                driverLocation={driverLocation}
                restaurantLocation={order.restaurantLocation?.coordinates}
                customerLocation={order.customerLocation?.coordinates}
                height="350px"
              />
              {order.status === 'out_for_delivery' && order.deliveryDriver && (
                <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{order.deliveryDriver.name}</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Delivery Partner</div>
                  </div>
                  {order.deliveryDriver.phone && (
                    <a href={`tel:${order.deliveryDriver.phone}`} style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-primary)' }}>
                      <FiPhone /> Call
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Order Details */}
          <div>
            <div className="dash-card">
              <h3>Order Details</h3>
              <div style={{ marginBottom: '16px' }}>
                {order.items?.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--color-border)' }}>
                    <span>{item.name} × {item.quantity}</span>
                    <span style={{ fontWeight: 600 }}>₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.1rem' }}>
                <span>Total</span>
                <span>₹{order.totalAmount}</span>
              </div>
            </div>

            <div className="dash-card" style={{ marginTop: '16px' }}>
              <h3><FiMapPin /> Delivery Address</h3>
              <p style={{ color: 'var(--color-text-muted)' }}>{order.deliveryAddress}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
