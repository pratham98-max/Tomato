import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Signup = () => {
  const location = useLocation();
  const googleData = location.state || {};

  const [name, setName] = useState(googleData.name || '');
  const [email, setEmail] = useState(googleData.email || '');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup, loginWithGoogle, completeGoogleSignup } = useAuth();
  const navigate = useNavigate();

  const isGoogleFlow = !!googleData.firebaseToken;

  const roles = [
    { id: 'customer', label: 'Customer', icon: '👤', desc: 'Order food from restaurants' },
    { id: 'restaurant', label: 'Restaurant Owner', icon: '🏪', desc: 'Manage your restaurant' },
    { id: 'delivery', label: 'Delivery Partner', icon: '🚚', desc: 'Deliver orders & earn' }
  ];

  const dashboardMap = { customer: '/customer', restaurant: '/restaurant', delivery: '/delivery' };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!role) {
      setError('Please select a role');
      return;
    }
    setError('');
    setLoading(true);
    try {
      let user;
      if (isGoogleFlow) {
        // Complete Google signup with selected role
        user = await completeGoogleSignup(googleData.firebaseToken, role);
      } else {
        user = await signup(name, email, password, role, phone, address);
      }
      navigate(dashboardMap[user.role] || '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    }
    setLoading(false);
  };

  const handleGoogleSignup = async () => {
    if (!role) {
      setError('Please select a role first');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const result = await loginWithGoogle(role);
      if (result.needsRole) {
        // Already on signup — complete with selected role
        const user = await completeGoogleSignup(result.firebaseToken, role);
        navigate(dashboardMap[user.role] || '/');
      } else {
        navigate(dashboardMap[result.role] || '/');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Google signup failed');
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-left">
          <div className="auth-brand">
            <h1 className="auth-logo">tomato</h1>
            <p className="auth-tagline">Join the food revolution</p>
          </div>
        </div>
        <div className="auth-right">
          <div className="auth-form-wrapper">
            <h2>{isGoogleFlow ? 'Almost There!' : 'Create Account'}</h2>
            <p className="auth-subtitle">
              {isGoogleFlow ? 'Choose your role to complete signup' : 'Choose your role to get started'}
            </p>

            {error && <div className="auth-error">{error}</div>}

            {/* Role Selection */}
            <div className="role-selector">
              {roles.map((r) => (
                <div
                  key={r.id}
                  className={`role-card ${role === r.id ? 'active' : ''}`}
                  onClick={() => setRole(r.id)}
                >
                  <div className="role-icon">{r.icon}</div>
                  <div className="role-label">{r.label}</div>
                  <div className="role-desc">{r.desc}</div>
                </div>
              ))}
            </div>

            {/* Google Sign-Up */}
            {!isGoogleFlow && (
              <>
                <button className="google-btn" onClick={handleGoogleSignup} disabled={loading}>
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Sign up with Google
                </button>

                <div className="divider-text"><span>or</span></div>
              </>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              {!isGoogleFlow && (
                <>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" required />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
                  </div>
                  <div className="form-group">
                    <label>Password</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" required />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Phone</label>
                      <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 XXXXX XXXXX" />
                    </div>
                    <div className="form-group">
                      <label>Address</label>
                      <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Your address" />
                    </div>
                  </div>
                </>
              )}

              {isGoogleFlow && (
                <div style={{ padding: '12px 16px', background: 'var(--color-bg-light)', borderRadius: 'var(--radius-sm)', marginBottom: '8px' }}>
                  <div style={{ fontWeight: 600 }}>{name}</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>{email}</div>
                </div>
              )}

              <button type="submit" className="auth-btn" disabled={loading || !role}>
                {loading ? 'Creating account...' : isGoogleFlow ? 'Complete Signup' : 'Sign Up'}
              </button>
            </form>

            <p className="auth-switch">
              Already have an account? <Link to="/login">Log in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
