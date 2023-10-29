const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

io.on('connection', (socket) => {
  console.log('A user connected');
  // Your Socket.IO code here
});

server.listen(3000, () => {
  console.log('Server is running on port 3000');
});