import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';

// Wires up real-time chat. One room per conversationId.
// REST (chatRoutes) handles history + persistence as a fallback;
// this is purely for live push so messages appear instantly.
const initSocket = (io) => {
  // Authenticate the socket handshake using the same JWT as the REST API
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('No token provided'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (!user) return next(new Error('User not found'));
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.user.name} (${socket.id})`);

    socket.on('join_conversation', (conversationId) => {
      socket.join(conversationId);
    });

    socket.on('leave_conversation', (conversationId) => {
      socket.leave(conversationId);
    });

    socket.on('send_message', async ({ conversationId, text }) => {
      try {
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return;

        if (!conversation.participants.some((p) => p.toString() === socket.user._id.toString())) {
          conversation.participants.push(socket.user._id);
        }
        conversation.lastMessageAt = new Date();
        await conversation.save();

        const message = await Message.create({
          conversation: conversationId,
          sender: socket.user._id,
          text,
          readBy: [socket.user._id],
        });

        const populated = await message.populate('sender', 'name role');

        // Push to everyone in the room, including the sender (confirms delivery)
        io.to(conversationId).emit('new_message', populated);
      } catch (err) {
        socket.emit('error_message', { message: 'Could not send message' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.user.name}`);
    });
  });
};

export default initSocket;
