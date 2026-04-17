import { useState, useCallback, useEffect } from 'react';
import { sendChatMessage, getChatHistory, clearChatHistory } from '../services/chatApi.js';

export function useChat() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Auto-clear error messages after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Load chat history on mount
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = useCallback(async () => {
    try {
      setError(null);
      const data = await getChatHistory();
      setMessages(data.messages || []);
    } catch (err) {
      console.error('Failed to load history:', err);
      setError('Could not load chat history');
    }
  }, []);

  const sendMessage = useCallback(async (message) => {
    if (!message.trim()) return;

    // Add user message to local state immediately
    setMessages(prev => [...prev, { role: 'user', content: message, timestamp: new Date() }]);
    setLoading(true);
    setError(null);

    try {
      const response = await sendChatMessage(message);
      // Add assistant response - response.text contains the message
      setMessages(prev => [...prev, { role: 'assistant', content: response.text, timestamp: new Date() }]);
    } catch (err) {
      setError(err.error || 'Failed to send message. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearHistory = useCallback(async () => {
    try {
      setError(null);
      await clearChatHistory();
      setMessages([]);
    } catch (err) {
      setError('Failed to clear chat history');
      console.error('Error:', err);
    }
  }, []);

  return {
    messages,
    loading,
    error,
    sendMessage,
    clearHistory,
    loadHistory
  };
}
