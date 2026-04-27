import React from 'react';
import { FiStar } from 'react-icons/fi';
import './RestaurantCard.css';

const RestaurantCard = ({ restaurant }) => {
  return (
    <div className="restaurant-card">
      <div className="restaurant-image-container">
        <img src={restaurant.image} alt={restaurant.name} />
        {restaurant.promoted && <span className="promoted-tag">Promoted</span>}
        {restaurant.offer && <span className="offer-tag">{restaurant.offer}</span>}
        <div className="delivery-time">{restaurant.deliveryTime}</div>
      </div>
      
      <div className="restaurant-info">
        <div className="restaurant-header">
          <h3 className="restaurant-name">{restaurant.name}</h3>
          <div className="restaurant-rating">
            <span>{restaurant.rating}</span>
            <FiStar className="star-icon" />
          </div>
        </div>
        
        <div className="restaurant-details">
          <p className="restaurant-cuisines">{restaurant.cuisines}</p>
          <p className="restaurant-cost">{restaurant.costForTwo} for two</p>
        </div>
        
        <div className="restaurant-location">
          <p>{restaurant.location}</p>
        </div>
      </div>
    </div>
  );
};

export default RestaurantCard;
