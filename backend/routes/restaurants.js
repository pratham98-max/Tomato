const express = require('express');
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const { protect, requireRole } = require('../middleware/auth');
const router = express.Router();

// GET /api/restaurants - List restaurants (optionally filter by proximity)
// Query params: ?lat=12.97&lng=77.59&radius=10 (radius in km, default 10)
router.get('/', async (req, res) => {
  try {
    const { lat, lng, radius } = req.query;

    let restaurants;

    if (lat && lng) {
      const maxDistanceMeters = (parseFloat(radius) || 10) * 1000; // default 10 km
      restaurants = await Restaurant.find({
        location: {
          $nearSphere: {
            $geometry: {
              type: 'Point',
              coordinates: [parseFloat(lng), parseFloat(lat)]
            },
            $maxDistance: maxDistanceMeters
          }
        }
      }).populate('owner', 'name email');
    } else {
      // No location provided — return all restaurants
      restaurants = await Restaurant.find().populate('owner', 'name email');
    }

    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/restaurants/my - Get current owner's restaurant
router.get('/my', protect, requireRole('restaurant'), async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) {
      return res.status(404).json({ message: 'No restaurant found. Create one first.' });
    }
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/restaurants - Create restaurant (owner only)
router.post('/', protect, requireRole('restaurant'), async (req, res) => {
  try {
    const { name, description, address, cuisines, image, deliveryTime, costForTwo, location } = req.body;

    const existing = await Restaurant.findOne({ owner: req.user._id });
    if (existing) {
      return res.status(400).json({ message: 'You already have a restaurant' });
    }

    const restaurant = await Restaurant.create({
      owner: req.user._id,
      name,
      description,
      address,
      cuisines: cuisines || [],
      image,
      deliveryTime,
      costForTwo,
      location: location || undefined
    });

    res.status(201).json(restaurant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/restaurants/:id - Update restaurant
router.put('/:id', protect, requireRole('restaurant'), async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
    if (restaurant.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    Object.assign(restaurant, req.body);
    await restaurant.save();
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/restaurants/:id - Get single restaurant
router.get('/:id', async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id).populate('owner', 'name');
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/restaurants/:id/menu - Get menu items
router.get('/:id/menu', async (req, res) => {
  try {
    const items = await MenuItem.find({ restaurant: req.params.id });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/restaurants/:id/menu - Add menu item (owner only)
router.post('/:id/menu', protect, requireRole('restaurant'), async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
    if (restaurant.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { name, description, price, image, category, isVeg } = req.body;
    const item = await MenuItem.create({
      restaurant: req.params.id,
      name,
      description,
      price,
      image,
      category,
      isVeg
    });

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/restaurants/:id/menu/:itemId - Update menu item
router.put('/:id/menu/:itemId', protect, requireRole('restaurant'), async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    Object.assign(item, req.body);
    await item.save();
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/restaurants/:id/menu/:itemId - Delete menu item
router.delete('/:id/menu/:itemId', protect, requireRole('restaurant'), async (req, res) => {
  try {
    await MenuItem.findByIdAndDelete(req.params.itemId);
    res.json({ message: 'Item removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
