import asyncHandler from 'express-async-handler';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';

// @desc    Get all conversations the logged-in user is part of
// @route   GET /api/chat/conversations
// @access  Private
export const getMyConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({ participants: req.user._id })
    .populate('puppy', 'name photos')
    .sort({ lastMessageAt: -1 });
  res.json(conversations);
});

// @desc    Get message history for a conversation
// @route   GET /api/chat/conversations/:id/messages
// @access  Private (participant)
export const getMessages = asyncHandler(async (req, res) => {
  const conversation = await Conversation.findById(req.params.id);
  if (!conversation) {
    res.status(404);
    throw new Error('Conversation not found');
  }
  if (!conversation.participants.some((p) => p.toString() === req.user._id.toString())) {
    res.status(403);
    throw new Error('Not a participant in this conversation');
  }

  const messages = await Message.find({ conversation: req.params.id })
    .populate('sender', 'name role')
    .sort({ createdAt: 1 });
  res.json(messages);
});

// @desc    Send a message (REST fallback - Socket.io handles live delivery)
// @route   POST /api/chat/conversations/:id/messages
// @access  Private (participant)
export const sendMessage = asyncHandler(async (req, res) => {
  const conversation = await Conversation.findById(req.params.id);
  if (!conversation) {
    res.status(404);
    throw new Error('Conversation not found');
  }

  // Auto-join shelter staff to the conversation on their first reply
  if (!conversation.participants.some((p) => p.toString() === req.user._id.toString())) {
    conversation.participants.push(req.user._id);
  }
  conversation.lastMessageAt = new Date();
  await conversation.save();

  const message = await Message.create({
    conversation: conversation._id,
    sender: req.user._id,
    text: req.body.text,
    readBy: [req.user._id],
  });

  res.status(201).json(message);
});
