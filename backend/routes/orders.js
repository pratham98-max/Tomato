const express = require('express');
const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const { protect, requireRole } = require('../middleware/auth');
const router = express.Router();

// POST /api/orders - Place an order (customer)
router.post('/', protect, requireRole('customer'), async (req, res) => {
  try {
    const { restaurantId, items, totalAmount, deliveryAddress, customerLocation } = req.body;

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });

    const order = await Order.create({
      customer: req.user._id,
      restaurant: restaurantId,
      items,
      totalAmount,
      deliveryAddress,
      customerLocation: customerLocation || undefined,
      restaurantLocation: restaurant.location || undefined
    });

    const populated = await Order.findById(order._id)
      .populate('customer', 'name email phone')
      .populate('restaurant', 'name address');

    // Emit to restaurant owner via socket
    if (req.io) {
      req.io.to(`restaurant_${restaurantId}`).emit('newOrder', populated);
    }

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/orders - Get orders (role-filtered)
router.get('/', protect, async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'customer') {
      query.customer = req.user._id;
    } else if (req.user.role === 'restaurant') {
      const restaurant = await Restaurant.findOne({ owner: req.user._id });
      if (!restaurant) return res.json([]);
      query.restaurant = restaurant._id;
    } else if (req.user.role === 'delivery') {
      query.deliveryDriver = req.user._id;
    }

    const orders = await Order.find(query)
      .populate('customer', 'name email phone')
      .populate('restaurant', 'name address image')
      .populate('deliveryDriver', 'name phone')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/orders/:id - Get single order
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email phone address')
      .populate('restaurant', 'name address image location')
      .populate('deliveryDriver', 'name phone location');

    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/orders/:id/status - Update order status (owner/delivery)
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = status;
    await order.save();

    const populated = await Order.findById(order._id)
      .populate('customer', 'name email phone')
      .populate('restaurant', 'name address')
      .populate('deliveryDriver', 'name phone');

    // Emit real-time status update
    if (req.io) {
      req.io.to(`order_${order._id}`).emit('orderStatusUpdate', populated);
      req.io.to(`restaurant_${order.restaurant}`).emit('orderStatusUpdate', populated);
    }

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
