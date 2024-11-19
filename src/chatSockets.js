const Chats = require('./models/chats.js')


const socket = (io) => {
    io.on('connection', (socket) => {
        console.log(`A user connected on ${socket.id}`);
        
        socket.on('new user', async (username,isActive,role) => {
            console.log("new user -> ",username , role)
            try {
                const user = await Chats.findOne({ username: username });
                if (user == null) {
                    const newUser = new Chats({
                        username: username,
                        isActive: isActive,
                        id: socket.id,
                        role: role 
                    });
                    console.log("New user reg -> ", newUser)
                    await newUser.save();
                    if(role == "user"){
                        const user = await Chats.find({ role: "admin", isActive: true });
                        console.log(user)
                        if(user[0] && user[0].isActive){
                            io.to(user[0].id).emit('newClient', username);
                            io.to(user[0].id).emit('isUserActive', isActive);
                        }
                    }
                } else {
                    await Chats.updateOne({ username: username }, { $set: { id: socket.id, isActive : true, role: role } });
                }
            } catch (err) {
                console.error("Error -> ", err);
            }
           // console.log(`users -> ${JSON.stringify(users)}`);
          });
          socket.on('connectAdmin', async(client) => {
            console.log("Connect admin triggered ")
            try{
                const user = await Chats.find({ role: "admin", isActive: true });
                console.log(user)
                if(user[0] && user[0].isActive){
                    io.to(user[0].id).emit('newClient', client);
                }
            } catch (err){
                console.log(err)
            }
        });
        socket.on('connectClient', async(admin,client) => {
            console.log("Connect client triggered")
            try{
                const user = await Chats.findOne({ username: client });;
                console.log(user)
                if(user && user.isActive){
                    io.to(user.id).emit('adminConnected', `You are now connected with ${admin}`, admin);
                    io.to(user.id).emit('isUserActive', true);
                } else {
                    io.to(socket.id).emit('incoming', "User is not active");
                    io.to(socket.id).emit('isUserActive', user.isActive);
                }
            } catch (err){
                console.log(err)
            }
        });
       /* socket.on('cancelClientConnect', async(admin,client) => {
            console.log("Cancel client connected triggered")
            try{
                const user = await Chats.findOne({ username: client });;
                console.log(user)
                if(user && user.isActive){
                    io.to(user.id).emit('incoming', `All Admins are busy right now. Please wait for sometime`, admin);
                    io.to(user.id).emit('isUserActive', true);
                }
            } catch (err){
                console.log(err)
            }
        }) */
        socket.on('new to user', async(to) => {
            try {
                if(to){
                    const user = await Chats.findOne({ username: to });
                    if( user != null){
                        io.to(socket.id).emit('isUserActive', user.isActive)
                    } else {
                        console.log("no to username found")
                        io.to(socket.id).emit('user not found', user.isActive)
                    }
                }
            } catch (err) {
                console.log("Error at new to user", err)
            }
            
        })

        socket.on('outgoing', async(userMessage, username, to) => {
            console.log('outgoing message: ' + userMessage + ' ' + username + ' ' + to);
            try{
                const user = await Chats.findOne({ username: to });;
                console.log(user)
                if(user && user.isActive){
                    io.to(user.id).emit('incoming', userMessage, username);
                    io.to(user.id).emit('isUserActive', user.isActive);
                } else {
                    io.to(socket.id).emit('incoming', "Admin is not active , please come back later");
                    io.to(socket.id).emit('isUserActive', user.isActive);
                }
            } catch (err){
                console.log(err)
            }
        });

        socket.on('admin-outgoing', async(adminMessage, username, to) => {
            console.log('Admin outgoing message: ' + adminMessage + ' ' + username + ' ' + to);
            try{
                const user = await Chats.findOne({ username: to });
                    if( user != null && user.isActive){
                        io.to(user.id).emit('incoming', adminMessage, username);
                        io.to(user.id).emit('isUserActive', true);
                    } else {
                        io.to(socket.id).emit('incoming', "User is not active");
                        io.to(socket.id).emit('isUserActive', false);
                    }
            } catch (err){
                console.log(err)
            }
        })
        

       /* socket.on('typing', async(username,to) => {
            console.log(`${username} is typing`)
            const user = await Chats.findOne({ username: to });
            if(user && user.isActive){
                io.to(user.id).emit('typing','typing')
            }
            
        })

        socket.on('stop typing', async(username,to) => {
            console.log(`${username} is typing`)
            const user = await Chats.findOne({ username: to });
            if(user && user.isActive){
                io.to(user.id).emit('stop typing')
            }
        })  */

      /*  socket.on('disconnect', async() => {
          //  console.log(socket.id," discoonnected")
            try {
                const disconnectedUser = await Chats.findOne({ id: socket.id });
                if (disconnectedUser) {
                    disconnectedUser.isActive = false;
                    await disconnectedUser.save();
                    console.log(`${disconnectedUser.username} disconnected`);
                    io.to(socket.id).emit('clear', 'clear');
                }
            } catch (err) {
                console.error('Error -> ', err);
            }
            
        }); */
    });
};

module.exports = {
    socket
};