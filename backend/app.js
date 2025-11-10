const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const http = require("http");
const { Server } = require("socket.io");

const authRoutes = require("./routes/authRoutes");
const companyRoutes = require("./routes/companyRoutes");
const customerRoutes = require("./routes/customerRoutes");
const projectRoutes = require("./routes/projectRoutes");
const workerRoutes = require("./routes/workerRoutes");
const adminRoutes = require("./routes/adminRoutes");
const chatRoutes = require("./routes/chatRoutes");

const { PORT } = require("./config/constants");
const { ChatRoom } = require("./models");
const { authorizeChatAccess } = require("./controllers/chatController");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const onlineUsers = {};

io.on("connection", (socket) => {
  socket.on("joinRoom", async ({ roomId, userId, userRole }) => {
    if (!userId || !roomId) return;
    socket.join(roomId);
    onlineUsers[userId] = { socketId: socket.id, roomId, userRole };
    socket.userId = userId;
    socket.roomId = roomId;

    const authResult = await authorizeChatAccess(roomId, userId, userRole);
    if (authResult.authorized) {
      const otherUserId = authResult.otherUserId.toString();
      const other = onlineUsers[otherUserId];
      if (other) {
        io.to(other.socketId).emit("userStatus", { isOnline: true });
        socket.emit("userStatus", { isOnline: true });
      } else {
        socket.emit("userStatus", { isOnline: false });
      }
    }
  });

  socket.on("chatMessage", async ({ roomId, sender, senderModel, message }) => {
    try {
      const chatRoom = await ChatRoom.findOne({ roomId });
      if (chatRoom) {
        const newMessage = {
          sender,
          senderModel,
          message,
          createdAt: new Date(),
        };
        chatRoom.messages.push(newMessage);
        await chatRoom.save();
        socket
          .to(roomId)
          .emit("message", {
            sender,
            message,
            createdAt: newMessage.createdAt,
          });
      }
    } catch (error) {
      console.error("Error saving message:", error);
    }
  });

  socket.on("disconnect", async () => {
    const userId = socket.userId;
    const roomId = socket.roomId;
    if (userId && onlineUsers[userId]) {
      const authResult = await authorizeChatAccess(
        roomId,
        userId,
        onlineUsers[userId].userRole
      );
      const otherUserId = authResult.authorized
        ? authResult.otherUserId.toString()
        : null;
      delete onlineUsers[userId];
      if (otherUserId && onlineUsers[otherUserId]) {
        io.to(onlineUsers[otherUserId].socketId).emit("userStatus", {
          isOnline: false,
        });
      }
    }
  });
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.json());
app.use(express.static("Final Pages"));
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
connectDB();

app.get("/", (req, res) => {
  // routed file : landing_page
  res.status(200).json({ view: "landing_page" });
});

app.get("/signin_up", (req, res) => {
  // routed file : signin_up_
  res.status(200).json({ view: "signin_up_" });
});

app.get("/adminpage", (req, res) => {
  // routed file : adminlogin
  res.status(200).json({ view: "adminlogin" });
});

app.get("/logout", (req, res) => {
  res.clearCookie("token", { httpOnly: true, sameSite: "lax", path: "/" });
  res.status(200).json({ redirect: "/" });
});

app.get("/platformadmindashboard", (req, res) => {
  // routed file : platform_admin/platform_admin_dashboard
  res.status(200).json({ view: "platform_admin/platform_admin_dashboard" });
});

// app.js
app.use('/api', authRoutes);           // → /api/signup, /api/login
app.use('/api', customerRoutes);
app.use('/api', companyRoutes);
app.use('/api', workerRoutes);
app.use('/api', projectRoutes);
app.use('/api', adminRoutes);
app.use('/api', chatRoutes);

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Accepting requests from http://localhost:5173`);
});