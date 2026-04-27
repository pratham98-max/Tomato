import React from 'react';
import { restaurants } from '../data/mockData';
import RestaurantCard from './RestaurantCard';
import './RestaurantGrid.css';

const RestaurantGrid = () => {
  return (
    <section className="restaurant-section container">
      <h2 className="section-title">Delivery Restaurants in Bangalore</h2>
      
      <div className="filters">
        <button className="filter-btn">Filters</button>
        <button className="filter-btn">Rating: 4.0+</button>
        <button className="filter-btn">Pure Veg</button>
        <button className="filter-btn">Cuisines</button>
      </div>
      
      <div className="restaurant-grid">
        {restaurants.map((restaurant) => (
          <RestaurantCard key={restaurant.id} restaurant={restaurant} />
        ))}
      </div>
    </section>
  );
};

export default RestaurantGrid;
