const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const http = require('http'); 
const { Server } = require('socket.io'); 

const authRoutes = require('./routes/authRoutes');
const companyRoutes = require('./routes/companyRoutes');
const customerRoutes = require('./routes/customerRoutes');
const projectRoutes = require('./routes/projectRoutes');
const workerRoutes = require('./routes/workerRoutes');
const adminRoutes = require('./routes/adminRoutes');
const chatRoutes = require('./routes/chatRoutes'); 

const { PORT } = require('./config/constants');
const { ChatRoom } = require('./models'); 
const { authorizeChatAccess } = require('./controllers/chatController'); 

const app = express();
const server = http.createServer(app); 
const io = new Server(server); 

// --- FIXED: Socket.io Logic ---
const onlineUsers = {}; 

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Handle joining a room and user status
    socket.on('joinRoom', async ({ roomId, userId, userName, userRole }) => {
        if (!userId || !roomId) return;
        
        socket.join(roomId);
        
        onlineUsers[userId] = { socketId: socket.id, roomId: roomId, userRole: userRole };
        socket.userId = userId; 
        socket.roomId = roomId; 

        // --- Online Status Logic ---
        const authResult = await authorizeChatAccess(roomId, userId, userRole);
        
        if(authResult.authorized) {
            // Ensure otherUserId is a string for lookup
            const otherUserId = authResult.otherUserId.toString(); 
            const otherUserConnection = onlineUsers[otherUserId];

            // Notify the other user that this user is now online
            if (otherUserConnection && otherUserConnection.socketId) {
                io.to(otherUserConnection.socketId).emit('userStatus', { isOnline: true });
                // Also update status for the user who just joined
                socket.emit('userStatus', { isOnline: true });
            } else {
                // If the other user is not connected, display 'Offline'
                socket.emit('userStatus', { isOnline: false });
            }
        }
    });

    // Handle sending a message
    socket.on('chatMessage', async (messageData) => {
        try {
            // Ensure we capture all necessary fields from the client
            const { roomId, sender, senderModel, message } = messageData; 
            
            // 1. Save message to MongoDB
            const chatRoom = await ChatRoom.findOne({ roomId });
            if (chatRoom) {
                const newMessage = {
                    sender: sender, 
                    senderModel: senderModel, 
                    message: message,
                    createdAt: new Date()
                };
                chatRoom.messages.push(newMessage);
                await chatRoom.save();

                // 2. CRITICAL FIX: Broadcast the message to all OTHER clients in the room
                //    socket.to(roomId) targets every socket in the room EXCEPT the sender.
                socket.to(roomId).emit('message', {
                    sender: sender, 
                    message: message,
                    createdAt: newMessage.createdAt
                });
            }
        } catch (error) {
            console.error('Error saving or broadcasting message:', error);
        }
    });

    // Handle user disconnecting
    socket.on('disconnect', async () => {
        const userId = socket.userId;
        const roomId = socket.roomId;
        
        if (userId && onlineUsers[userId]) {
            const authResult = await authorizeChatAccess(roomId, userId, onlineUsers[userId].userRole);
            const otherUserId = authResult.authorized ? authResult.otherUserId.toString() : null;

            delete onlineUsers[userId];
            console.log(`User disconnected: ${socket.id} (ID: ${userId})`);

            // Notify the other user that this user is now offline
            if (otherUserId && onlineUsers[otherUserId]) {
                io.to(onlineUsers[otherUserId].socketId).emit('userStatus', { isOnline: false });
            }
        } else {
             console.log(`User disconnected: ${socket.id}`);
        }
    });
});
// --- END FIXED Socket.io Logic ---


// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.json());
app.use(express.static('Final Pages'));
app.use(cors({ origin: true, credentials: true }));
/* app.use('/uploads', express.static(path.join(__dirname, 'Uploads'))); */

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Connect DB
connectDB();

// Routes
app.get('/', (req, res) => res.render('landing_page'));
app.get('/signin_up', (req, res) => res.render('signin_up_'));
app.get('/adminpage', (req, res) => res.render('adminlogin'));
app.get('/logout', (req,res)=>{
    res.clearCookie('token');
    res.redirect('/');
});
app.get('/platformadmindashboard', (req, res) => res.render('platform_admin/platform_admin_dashboard'));

app.use(authRoutes);
app.use(customerRoutes);
app.use(companyRoutes);
app.use(projectRoutes);
app.use(workerRoutes);
app.use(adminRoutes);
app.use(chatRoutes); 

// Start server
server.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));