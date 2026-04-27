const express = require('express');
const Order = require('../models/Order');
const User = require('../models/User');
const { protect, requireRole } = require('../middleware/auth');
const router = express.Router();

// GET /api/delivery/available - Get orders ready for pickup
router.get('/available', protect, requireRole('delivery'), async (req, res) => {
  try {
    const orders = await Order.find({
      status: 'ready',
      deliveryDriver: null
    })
      .populate('customer', 'name phone address')
      .populate('restaurant', 'name address location')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/delivery/my - Get driver's active deliveries
router.get('/my', protect, requireRole('delivery'), async (req, res) => {
  try {
    const orders = await Order.find({
      deliveryDriver: req.user._id,
      status: { $in: ['out_for_delivery', 'picked_up'] }
    })
      .populate('customer', 'name phone address')
      .populate('restaurant', 'name address location')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/delivery/:orderId/accept - Accept a delivery
router.put('/:orderId/accept', protect, requireRole('delivery'), async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.deliveryDriver) {
      return res.status(400).json({ message: 'Order already assigned to a driver' });
    }

    order.deliveryDriver = req.user._id;
    order.status = 'out_for_delivery';
    await order.save();

    const populated = await Order.findById(order._id)
      .populate('customer', 'name phone address')
      .populate('restaurant', 'name address location')
      .populate('deliveryDriver', 'name phone');

    if (req.io) {
      req.io.to(`order_${order._id}`).emit('orderStatusUpdate', populated);
      req.io.to(`restaurant_${order.restaurant}`).emit('orderStatusUpdate', populated);
    }

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/delivery/:orderId/pickup - Mark as picked up from restaurant
router.put('/:orderId/pickup', protect, requireRole('delivery'), async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.status !== 'out_for_delivery') {
      return res.status(400).json({ message: 'Order not in out_for_delivery status' });
    }

    order.status = 'picked_up';
    await order.save();

    const populated = await Order.findById(order._id)
      .populate('customer', 'name phone address')
      .populate('restaurant', 'name address location')
      .populate('deliveryDriver', 'name phone');

    if (req.io) {
      req.io.to(`order_${order._id}`).emit('orderStatusUpdate', populated);
      req.io.to(`restaurant_${order.restaurant}`).emit('orderStatusUpdate', populated);
    }

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/delivery/:orderId/location - Update driver location
router.put('/:orderId/location', protect, requireRole('delivery'), async (req, res) => {
  try {
    const { coordinates } = req.body;
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.deliveryLocation = { type: 'Point', coordinates };
    await order.save();

    await User.findByIdAndUpdate(req.user._id, {
      location: { type: 'Point', coordinates }
    });

    if (req.io) {
      req.io.to(`order_${order._id}`).emit('locationUpdate', {
        orderId: order._id,
        coordinates
      });
    }

    res.json({ message: 'Location updated', coordinates });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/delivery/:orderId/deliver - Mark as delivered
router.put('/:orderId/deliver', protect, requireRole('delivery'), async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = 'delivered';
    await order.save();

    const populated = await Order.findById(order._id)
      .populate('customer', 'name phone address')
      .populate('restaurant', 'name address')
      .populate('deliveryDriver', 'name phone');

    if (req.io) {
      req.io.to(`order_${order._id}`).emit('orderStatusUpdate', populated);
    }

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
