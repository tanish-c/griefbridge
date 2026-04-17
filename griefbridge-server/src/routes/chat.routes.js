import express from 'express';
import { sendChatMessage, getChatHistory, clearChat } from '../controllers/chat.controller.js';

const router = express.Router();

// Send a message and get a response from Gemini chatbot
router.post('/message', sendChatMessage);

// Get chat history for the authenticated user
router.get('/history', getChatHistory);

// Clear chat history for the authenticated user
router.delete('/clear', clearChat);

export default router;
