const setupSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join an order room (for real-time tracking)
    socket.on('joinOrder', (orderId) => {
      socket.join(`order_${orderId}`);
      console.log(`Socket ${socket.id} joined order room: order_${orderId}`);
    });

    // Leave an order room
    socket.on('leaveOrder', (orderId) => {
      socket.leave(`order_${orderId}`);
    });

    // Join restaurant room (for restaurant owners to get new orders)
    socket.on('joinRestaurant', (restaurantId) => {
      socket.join(`restaurant_${restaurantId}`);
      console.log(`Socket ${socket.id} joined restaurant room: restaurant_${restaurantId}`);
    });

    // Delivery driver sends location update
    socket.on('driverLocationUpdate', (data) => {
      const { orderId, coordinates } = data;
      io.to(`order_${orderId}`).emit('locationUpdate', {
        orderId,
        coordinates
      });
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};

module.exports = setupSocket;
