import Chat from '../models/Chat.model.js';
import { sendMessage, initializeChat } from '../services/gemini.service.js';

export async function sendChatMessage(req, res, next) {
  try {
    const { message } = req.body;
    const userId = req.userId;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    // Get or create chat session for this user
    let chat = await Chat.findOne({ userId });
    if (!chat) {
      chat = await Chat.create({ userId, messages: [] });
    }

    // Add user message to history
    chat.messages.push({
      role: 'user',
      content: message.trim()
    });

    // Prepare messages for Gemini
    const conversationHistory = chat.messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // Get response from Gemini
    let geminiResponse;
    try {
      if (chat.messages.length === 1) {
        // First message - use initialize with system prompt
        geminiResponse = await initializeChat(message.trim());
      } else {
        // Subsequent messages
        geminiResponse = await sendMessage(conversationHistory);
      }
    } catch (error) {
      // Remove the message we just added if Gemini fails
      chat.messages.pop();
      await chat.save();
      throw error;
    }

    // Add assistant response to history
    chat.messages.push({
      role: 'assistant',
      content: geminiResponse
    });

    // Update the updatedAt timestamp for TTL
    chat.updatedAt = new Date();
    await chat.save();

    res.json({ text: geminiResponse });
  } catch (error) {
    next(error);
  }
}

export async function getChatHistory(req, res, next) {
  try {
    const userId = req.userId;

    const chat = await Chat.findOne({ userId });
    if (!chat) {
      return res.json({ messages: [] });
    }

    res.json({ messages: chat.messages });
  } catch (error) {
    next(error);
  }
}

export async function clearChat(req, res, next) {
  try {
    const userId = req.user.id;

    await Chat.findOneAndDelete({ userId });

    res.json({ success: true, message: 'Chat history cleared' });
  } catch (error) {
    next(error);
  }
}
