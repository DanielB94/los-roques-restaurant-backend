// socket.js
const { Server } = require('socket.io');
const Order = require('../models/ordersModel');
const MenuItem = require('../models/menuModel');

function initializeSocket(server) {
  const io = new Server(server, {
    cors: {
        origin: ["http://localhost:3200", "http://localhost:3000", "https://danielb94.github.io", 'https://www.losroquesrestaurant.com']
      }
  });
  
  console.log('connected to socket');

  io.on('connection', (socket) => {
    console.log('A client connected');

    // Handle socket events here
    socket.on('joinRoom',(data)=>{
      console.log(data)
                console.log('user joined room' + data)
                socket.join(data);
            })

            socket.on('disconnect', () => {
              console.log('A client disconnected');
              
              
            });
          });
          Order.watch().on('change', async (change)=>{
            console.log('Something has changed');
            console.log(change.documentKey._id);
            const order = await Order.findById(change.documentKey._id);
            if(order.paid !== false || order.status !== false) {
            io.to('AdminRoom').emit('changes', order);
            }
          });

          MenuItem.watch().on('change', async (change) => {
            console.log('Something has changed on menu');
            const menu = await MenuItem.find();
            io.to('AdminRoom').emit('menuChanges', menu);
          });

  return { io };
}




module.exports = { initializeSocket };