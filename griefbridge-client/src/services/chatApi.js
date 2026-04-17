import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add JWT token to all requests
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

export async function sendChatMessage(message) {
  try {
    const response = await api.post('/api/chat/message', { message });
    return response.data; // Returns { text: "..." }
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error.response?.data || { error: 'Failed to send message' };
  }
}

export async function getChatHistory() {
  try {
    const response = await api.get('/api/chat/history');
    return response.data;
  } catch (error) {
    console.error('Error fetching chat history:', error);
    throw error.response?.data || { error: 'Failed to fetch history' };
  }
}

export async function clearChatHistory() {
  try {
    const response = await api.delete('/api/chat/clear');
    return response.data;
  } catch (error) {
    console.error('Error clearing chat history:', error);
    throw error.response?.data || { error: 'Failed to clear history' };
  }
}
