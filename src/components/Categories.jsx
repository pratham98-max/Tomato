import React from 'react';
import { categories } from '../data/mockData';
import './Categories.css';

const Categories = () => {
  return (
    <section className="categories-section container">
      <div className="categories-grid">
        {categories.map((category) => (
          <div key={category.id} className="category-card">
            <div className="category-image">
              <img src={category.image} alt={category.title} />
            </div>
            <div className="category-info">
              <h3>{category.title}</h3>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Categories;
