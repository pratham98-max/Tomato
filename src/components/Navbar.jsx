import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiMapPin, FiMenu, FiX, FiUser } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDashboard = () => {
    if (!user) return navigate('/login');
    const map = { customer: '/customer', restaurant: '/restaurant', delivery: '/delivery' };
    navigate(map[user.role] || '/');
  };

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container navbar-container">
        
        {/* Mobile Menu Toggle */}
        <button 
          className="mobile-toggle" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>

        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <span className="logo-text">tomato</span>
        </Link>

        {/* Search Bar - Only visible on scroll */}
        <div className={`navbar-search-wrapper ${isScrolled ? 'visible' : 'hidden'}`}>
          {isScrolled && (
            <div className="navbar-search glass-morphism">
              <div className="location-input">
                <FiMapPin className="icon-map" />
                <input type="text" placeholder="Ywca, 1, Ashoka Rd, Hanuman..." defaultValue="Bangalore" />
              </div>
              <div className="divider"></div>
              <div className="search-input">
                <FiSearch className="icon-search" />
                <input type="text" placeholder="Search for restaurant, cuisine or a dish" />
              </div>
            </div>
          )}
        </div>

        {/* Desktop Actions */}
        <div className="navbar-actions">
          {user ? (
            <>
              <button className="btn-ghost nav-link" onClick={handleDashboard}>Dashboard</button>
              <button className="btn-ghost nav-link" onClick={() => { logout(); navigate('/'); }}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost nav-link">Log in</Link>
              <Link to="/signup" className="btn-ghost nav-link">Sign up</Link>
            </>
          )}
        </div>

        {/* Mobile User Profile */}
        <div className="mobile-user" onClick={handleDashboard} style={{ cursor: 'pointer' }}>
          <FiUser size={24} />
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-search">
           <div className="mobile-search-bar">
             <FiSearch />
             <input type="text" placeholder="Search for restaurant..." />
           </div>
        </div>
        <ul>
          {user ? (
            <>
              <li><a onClick={handleDashboard} style={{ cursor: 'pointer' }}>Dashboard</a></li>
              <li><a onClick={() => { logout(); navigate('/'); setMobileMenuOpen(false); }} style={{ cursor: 'pointer' }}>Logout</a></li>
            </>
          ) : (
            <>
              <li><Link to="/login" onClick={() => setMobileMenuOpen(false)}>Log in</Link></li>
              <li><Link to="/signup" onClick={() => setMobileMenuOpen(false)}>Sign up</Link></li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
