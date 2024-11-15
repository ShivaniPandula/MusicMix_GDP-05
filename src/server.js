const express = require('express')
const dotenv=require('dotenv').config()
const port = process.env.PORT || 4040
const app = express()
const path=require('path')
const cors = require('cors')
const helmet = require('helmet')
const sockets=require("./chatSockets.js")
const http = require('http')
const socketIo = require('socket.io');
const server = http.createServer(app);
const io = socketIo(server);
sockets.socket(io);
const connectDatabase = require('./db/connection.js')
const publicRouters = require('./routers/publicRoutes.js')
const adminRouters = require('./routers/adminRoutes.js')
const publicDirectoryPath=path.join(__dirname,'../public')
const adminDirectoryPath=path.join(__dirname,'../admin')

app.use(express.static(publicDirectoryPath))

// Serve admin files
app.use('/admin', express.static(adminDirectoryPath));
app.use(express.json())
//app.use(cors())
app.use(
  helmet({
    contentSecurityPolicy: false,
    xDownloadOptions: false,
  })
);
app.use(express.urlencoded({ extended: true }));


app.use('/public/api', publicRouters)
app.use('/admin/api', adminRouters)

// Test
app.get('/test', (req,res) => {
    res.send("Server is running...");
})



// Server starts after database connection
connectDatabase().then(() => {
  server.listen(port, () => {
      console.log(`Server started at http://localhost:${port}`);
  });
}).catch((err) => {
  console.error('Unable to start server');
  process.exit(1); // Exit process with failure
});
