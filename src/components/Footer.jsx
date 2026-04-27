import React from 'react';
import { FiFacebook, FiTwitter, FiInstagram, FiLinkedin, FiYoutube } from 'react-icons/fi';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer-section">
      <div className="container">
        <div className="footer-top">
          <div className="footer-logo">
            <span className="logo-text-dark">tomato</span>
          </div>
          <div className="footer-selectors">
            <button className="lang-btn">India</button>
            <button className="lang-btn">English</button>
          </div>
        </div>
        
        <div className="footer-links-grid">
          <div className="footer-col">
            <h4>About Zomato</h4>
            <ul>
              <li><a href="#">Who We Are</a></li>
              <li><a href="#">Blog</a></li>
              <li><a href="#">Work With Us</a></li>
              <li><a href="#">Investor Relations</a></li>
              <li><a href="#">Report Fraud</a></li>
              <li><a href="#">Contact Us</a></li>
            </ul>
          </div>
          
          <div className="footer-col">
            <h4>Zomaverse</h4>
            <ul>
              <li><a href="#">Zomato</a></li>
              <li><a href="#">Blinkit</a></li>
              <li><a href="#">Feeding India</a></li>
              <li><a href="#">Hyperpure</a></li>
              <li><a href="#">Zomaland</a></li>
            </ul>
          </div>
          
          <div className="footer-col">
            <h4>For Restaurants</h4>
            <ul>
              <li><a href="#">Partner With Us</a></li>
              <li><a href="#">Apps For You</a></li>
            </ul>
            <h4 style={{ marginTop: '20px' }}>For Enterprises</h4>
            <ul>
              <li><a href="#">Zomato For Enterprise</a></li>
            </ul>
          </div>
          
          <div className="footer-col">
            <h4>Learn More</h4>
            <ul>
              <li><a href="#">Privacy</a></li>
              <li><a href="#">Security</a></li>
              <li><a href="#">Terms</a></li>
              <li><a href="#">Sitemap</a></li>
            </ul>
          </div>
          
          <div className="footer-col">
            <h4>Social Links</h4>
            <div className="social-icons">
              <a href="#"><FiLinkedin /></a>
              <a href="#"><FiInstagram /></a>
              <a href="#"><FiTwitter /></a>
              <a href="#"><FiYoutube /></a>
              <a href="#"><FiFacebook /></a>
            </div>
            <img 
              className="app-badges" 
              src="https://b.zmtcdn.com/data/webuikit/9f0c85a5e33adb783fa0aef667075f9e1556003622.png" 
              alt="App Store" 
            />
            <img 
              className="app-badges" 
              src="https://b.zmtcdn.com/data/webuikit/23e930757c3df49840c482a8638bf5c31556001144.png" 
              alt="Play Store" 
            />
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>By continuing past this page, you agree to our Terms of Service, Cookie Policy, Privacy Policy and Content Policies. All trademarks are properties of their respective owners. 2008-2023 © Zomato™ Ltd. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
