const express = require('express')
const app = express();
const server = require("http").createServer(app);
const bodyParser = require('body-parser')
// const io = require("socket.io").listen(server);
const port = 4000;
const io = require('socket.io')(port);

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
);

let chatRooms = []
let reports = []
const USER = [
  {
    id: 'RPTR001',
    name: 'Juan Dela Cruz',
    account: {
      username: 'juan',
      password: '1234',
      type: 'Reporter',
      isLoggedIn: false,

    },
    reports: [],
    latestReport: {}
  },
  {
    id: 'RSPD001',
    name: 'Mark Santos',
    account: {
      username: 'mark',
      password: '1234',
      type: 'Responder',
      isLoggedIn: false,

    },
    reports: [],
    latestReport: {}
  }
]

const generateID = () => Math.random().toString(36).substring(2, 10);
let conditionMet = false; // This variable represents the condition you want to check


// Socket.io logic
io.on('connection', (socket) => {
    console.log('A user connected');
  
    socket.on('join', (room) => {
      // Join a specific room
      socket.join(room);
      console.log(`User joined room: ${room}`);
    });
  
    socket.on('message', (room, message) => {
      // Broadcast the message to everyone in the room
        app.post("/reportList", (req, res) => {
            console.log('checking report.... ' + JSON.stringify(req.body))
            io.to(room).emit('message', 'SOCKET CONNECTED');
            res.json({data: 'success'});
        });

        // this endpoint should be listened to the responder
        app.post("/report", (req, res) => {
            console.log('checking report.... ' + req.body.id)
            const latestRequest = {
              id: req.body.id,
              reporterId: req.body.reporterId,
              reporterName: req.body.reporterName,
              details: req.body.details,
              status: req.body.status,
              coor: req.body.coor,
              responderName: req.body.responderName,
              img64: req.body.img64
            }
            reports.push(latestRequest);
            io.to(room).emit('message', reports);
            console.log(reports)
            const data = {
              data: reports,
              message: 'success'
            }
            res.json(data);
        });

        app.post("/acceptReport", (req, res) => {
            console.log('accepting report.... ' + req.body.id + " " + req.body.responderName)
            // io.to(room).emit('message', 'New Reported Incident');
            // res.json(reports.map(item => {
            //     if (item.id === req.body.id) {
            //       console.log(JSON.stringify(item) + ' ITEM FOUND')
            //       // Create a new object with the updated value
            //       return { ...item, status: "Accepted", responderName: req.body.responderName };
            //     }
            //     // return item;
            // }));
            // res.json(reports)
            // const result = reports.filter(item => item.id === req.body.id);
            // console.log(result , ' acceptReport Result')
            // res.json(result);

            // Use map to modify the item with the matching id
            const updatedReports = reports.map((item) => {
              if (item.id === req.body.id) {
                return { ...item, status: "Accepted", responderName: req.body.responderName };
              } else {
                return item;
              }
            });

            // Update the original array with the modified item
            reports.length = 0; // Clear the original array
            updatedReports.forEach((item) => reports.push(item)); // Update with modified items
            console.log(updatedReports, ' UPDATED REPORTS')
            io.to(room).emit('message', updatedReports);
            res.json(updatedReports);
        });

    });
  
    socket.on('disconnect', () => {
      console.log('A user disconnected');
      reports = []
      io.to(room).emit('message', reports);
    });
});

app.post("/checkReport2", (req, res) => {
    console.log('checking report.... ' + JSON.stringify(req.body))
    io.on('connection', (socket) => {
        console.log('socket connected');

        socket.on('join', (room) => {
            // Join a specific room
            socket.join(room);
            console.log(`User joined room: ${room}`);
          });
    })
    res.json(chatRooms);
});


app.post("/login", (req, res) => {
  console.log('LOGIN')
  const username = req.body.username;
  const password = req.body.password;
  let foundAccount = {}
  let isInvalid = true;

  for (const user of USER) {
    if (user.account.username === username && user.account.password === password) {
      user.account.isLoggedIn = true; // Set the user as logged in
      // res.json(user); // Return the user object
      foundAccount = user;
      isInvalid = false;
    }
  }
  if (isInvalid) {
    res.json({error: 'Invalid Credentials', account: {isLoggedIn: false}}); 
  } else {
    res.json(foundAccount)
  }
});

server.listen(3000, () => console.log('Connected to port 3000'))