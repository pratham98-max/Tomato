require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const User = require('./models/User');
const Restaurant = require('./models/Restaurant');
const MenuItem = require('./models/MenuItem');

const seedData = async () => {
  await connectDB();

  // Clear existing data and stale indexes
  const collections = await mongoose.connection.db.listCollections().toArray();
  for (const col of collections) {
    await mongoose.connection.db.dropCollection(col.name);
  }

  console.log('🗑️  Cleared existing data');

  // ---- Create Users ----
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password123', salt);

  const owner1 = await User.create({
    name: 'Rahul Sharma',
    email: 'rahul@restaurant.com',
    password: hashedPassword,
    role: 'restaurant',
    phone: '+91 98765 43210'
  });

  const owner2 = await User.create({
    name: 'Priya Patel',
    email: 'priya@restaurant.com',
    password: hashedPassword,
    role: 'restaurant',
    phone: '+91 98765 43211'
  });

  const owner3 = await User.create({
    name: 'Arjun Reddy',
    email: 'arjun@restaurant.com',
    password: hashedPassword,
    role: 'restaurant',
    phone: '+91 98765 43212'
  });

  const customer = await User.create({
    name: 'Test Customer',
    email: 'customer@test.com',
    password: hashedPassword,
    role: 'customer',
    phone: '+91 99999 00000',
    address: '123 MG Road, Bangalore'
  });

  const driver = await User.create({
    name: 'Delivery Kumar',
    email: 'driver@test.com',
    password: hashedPassword,
    role: 'delivery',
    phone: '+91 88888 00000'
  });

  console.log('👤 Created users');

  // ---- Create Restaurants ----
  const rest1 = await Restaurant.create({
    owner: owner1._id,
    name: 'Truffles',
    description: 'Famous for burgers and all-day breakfast. A Bangalore institution since 2010.',
    address: '93/1, 4th B Cross Rd, Koramangala, Bangalore',
    cuisines: ['Burger', 'American', 'Cafe', 'Fast Food'],
    rating: 4.5,
    totalRatings: 10500,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80',
    isOpen: true,
    deliveryTime: '30-35 min',
    costForTwo: 800,
    location: { type: 'Point', coordinates: [77.6245, 12.9352] }
  });

  const rest2 = await Restaurant.create({
    owner: owner2._id,
    name: 'Meghana Foods',
    description: 'Best Andhra Biryani in Bangalore. Every visit is a flavour explosion.',
    address: '124, Indiranagar, Bangalore',
    cuisines: ['Biryani', 'Andhra', 'North Indian', 'Chinese'],
    rating: 4.4,
    totalRatings: 15000,
    image: 'https://images.unsplash.com/photo-1563379091339-03f2184cb3aa?auto=format&fit=crop&w=500&q=80',
    isOpen: true,
    deliveryTime: '25-30 min',
    costForTwo: 600,
    location: { type: 'Point', coordinates: [77.6408, 12.9784] }
  });

  const rest3 = await Restaurant.create({
    owner: owner3._id,
    name: 'Pizza Bakery',
    description: 'Artisanal wood-fired pizzas with homemade fresh dough and imported toppings.',
    address: '45, JP Nagar 7th Phase, Bangalore',
    cuisines: ['Pizza', 'Italian', 'Pasta', 'Desserts'],
    rating: 4.7,
    totalRatings: 4100,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=500&q=80',
    isOpen: true,
    deliveryTime: '40-45 min',
    costForTwo: 1200,
    location: { type: 'Point', coordinates: [77.5855, 12.9063] }
  });

  console.log('🏪 Created restaurants');

  // ---- Create Menu Items ----
  // Truffles Menu
  await MenuItem.insertMany([
    { restaurant: rest1._id, name: 'Classic Smash Burger', description: 'Double patty, cheddar cheese, caramelized onions, house sauce', price: 299, category: 'Burgers', isVeg: false, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=300&q=80' },
    { restaurant: rest1._id, name: 'Truffle Fries', description: 'Crispy fries tossed in truffle oil, parmesan, fresh herbs', price: 199, category: 'Sides', isVeg: true, image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=300&q=80' },
    { restaurant: rest1._id, name: 'BBQ Chicken Wings', description: '8 pieces, smoked BBQ glaze, ranch dip', price: 349, category: 'Starters', isVeg: false, image: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&w=300&q=80' },
    { restaurant: rest1._id, name: 'Margherita Pizza', description: 'Fresh mozzarella, basil, San Marzano tomato sauce', price: 399, category: 'Pizza', isVeg: true, image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=300&q=80' },
    { restaurant: rest1._id, name: 'Chocolate Shake', description: 'Belgian chocolate, vanilla ice cream, whipped cream', price: 179, category: 'Beverages', isVeg: true, image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=300&q=80' },
    { restaurant: rest1._id, name: 'Paneer Burger', description: 'Crispy paneer patty, jalapeno mayo, fresh veggies', price: 249, category: 'Burgers', isVeg: true, image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=300&q=80' },
  ]);

  // Meghana Foods Menu
  await MenuItem.insertMany([
    { restaurant: rest2._id, name: 'Chicken Dum Biryani', description: 'Slow-cooked Andhra-style biryani with tender chicken pieces', price: 329, category: 'Biryani', isVeg: false, image: 'https://images.unsplash.com/photo-1563379091339-03f2184cb3aa?auto=format&fit=crop&w=300&q=80' },
    { restaurant: rest2._id, name: 'Mutton Biryani', description: 'Rich, aromatic mutton biryani, served with raita and salan', price: 399, category: 'Biryani', isVeg: false, image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=300&q=80' },
    { restaurant: rest2._id, name: 'Paneer Butter Masala', description: 'Creamy tomato-based curry with soft paneer cubes', price: 249, category: 'Main Course', isVeg: true, image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=300&q=80' },
    { restaurant: rest2._id, name: 'Butter Naan', description: 'Soft tandoori naan with butter, baked in clay oven', price: 49, category: 'Breads', isVeg: true, image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=300&q=80' },
    { restaurant: rest2._id, name: 'Chicken 65', description: 'Spicy, deep-fried chicken bites, Andhra-style', price: 279, category: 'Starters', isVeg: false, image: 'https://images.unsplash.com/photo-1610057099443-fde6c99db9e1?auto=format&fit=crop&w=300&q=80' },
    { restaurant: rest2._id, name: 'Gulab Jamun', description: 'Soft, warm gulab jamuns soaked in rose-flavored sugar syrup', price: 99, category: 'Desserts', isVeg: true, image: 'https://images.unsplash.com/photo-1666190064895-c7d396217862?auto=format&fit=crop&w=300&q=80' },
  ]);

  // Pizza Bakery Menu
  await MenuItem.insertMany([
    { restaurant: rest3._id, name: 'Wood-Fired Pepperoni', description: 'Classic pepperoni, mozzarella, oregano, on sourdough base', price: 549, category: 'Pizza', isVeg: false, image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=300&q=80' },
    { restaurant: rest3._id, name: 'Four Cheese Pizza', description: 'Mozzarella, gorgonzola, parmesan, fontina on thin crust', price: 599, category: 'Pizza', isVeg: true, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=300&q=80' },
    { restaurant: rest3._id, name: 'Aglio Olio Pasta', description: 'Spaghetti, garlic, olive oil, chilli flakes, fresh parsley', price: 349, category: 'Pasta', isVeg: true, image: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?auto=format&fit=crop&w=300&q=80' },
    { restaurant: rest3._id, name: 'Chicken Alfredo Pasta', description: 'Creamy white sauce pasta with grilled chicken strips', price: 449, category: 'Pasta', isVeg: false, image: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&w=300&q=80' },
    { restaurant: rest3._id, name: 'Tiramisu', description: 'Classic Italian dessert with espresso-soaked ladyfingers', price: 299, category: 'Desserts', isVeg: true, image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=300&q=80' },
    { restaurant: rest3._id, name: 'Garlic Bread', description: 'Toasted sourdough with garlic butter, mozzarella, herbs', price: 199, category: 'Sides', isVeg: true, image: 'https://images.unsplash.com/photo-1619531040576-f9416aabed02?auto=format&fit=crop&w=300&q=80' },
  ]);

  console.log('🍕 Created menu items');

  console.log('\n✅ Database seeded successfully!\n');
  console.log('📋 Demo Login Credentials:');
  console.log('┌────────────────────┬───────────────────────────┬───────────────┐');
  console.log('│ Role               │ Email                     │ Password      │');
  console.log('├────────────────────┼───────────────────────────┼───────────────┤');
  console.log('│ Customer           │ customer@test.com         │ password123   │');
  console.log('│ Restaurant (Truffles)│ rahul@restaurant.com    │ password123   │');
  console.log('│ Restaurant (Meghana)│ priya@restaurant.com     │ password123   │');
  console.log('│ Restaurant (Pizza) │ arjun@restaurant.com      │ password123   │');
  console.log('│ Delivery Driver    │ driver@test.com           │ password123   │');
  console.log('└────────────────────┴───────────────────────────┴───────────────┘');

  process.exit(0);
};

seedData().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
