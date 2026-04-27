import React from 'react';
import { FiSearch, FiMapPin } from 'react-icons/fi';
import './Hero.css';

const Hero = () => {
  return (
    <div className="hero-section">
      <div className="hero-background">
        <img 
          src="https://b.zmtcdn.com/web_assets/81f3ff974d82520780078ba1cfbd453a1583259680.png" 
          alt="Food Background" 
        />
      </div>
      
      <div className="hero-content container">
        <h1 className="hero-logo-text animate-fade-in" style={{ fontSize: '5rem', fontWeight: 800, fontStyle: 'italic', letterSpacing: '-2px', marginBottom: '1rem' }}>
          tomato
        </h1>
        
        <h1 className="hero-title animate-fade-in" style={{ animationDelay: '0.1s' }}>
          Discover the best food & drinks in <span className="text-gradient" style={{fontWeight: 600}}>Bangalore</span>
        </h1>
        
        <div className="hero-search-wrapper animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="hero-location">
            <FiMapPin style={{ color: 'var(--color-primary)', fontSize: '1.4rem' }} />
            <input type="text" placeholder="Ywca, 1, Ashoka Rd..." defaultValue="Bangalore" />
          </div>
          <div className="hero-divider"></div>
          <div className="hero-search">
            <FiSearch style={{ color: 'var(--color-text-light)', fontSize: '1.4rem' }} />
            <input type="text" placeholder="Search for restaurant, cuisine or a dish" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
