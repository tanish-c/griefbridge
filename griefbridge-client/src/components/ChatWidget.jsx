import React, { useRef, useEffect } from 'react';
import { useChat } from '../hooks/useChat.js';
import './ChatWidget.css';

export function ChatWidget() {
  const { messages, loading, error, sendMessage, clearHistory } = useChat();
  const [isOpen, setIsOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (inputValue.trim() && !loading) {
      sendMessage(inputValue);
      setInputValue('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !loading) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        className={`chat-widget-button ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Open Support Chat"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chat-widget-container">
          <div className="chat-widget-header">
            <h3>Support Chat</h3>
            <p className="chat-widget-subtitle">We're here to listen</p>
            <button
              className="chat-widget-close"
              onClick={() => setIsOpen(false)}
              title="Close Chat"
            >
              ✕
            </button>
          </div>

          <div className="chat-widget-messages">
            {messages.length === 0 ? (
              <div className="chat-widget-welcome">
                <p>
                  👋 Welcome! I'm here to listen and support you during this difficult time.
                </p>
                <p>Feel free to share your thoughts, feelings, or anything on your mind.</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`chat-widget-message ${message.role === 'user' ? 'user' : 'assistant'}`}
                >
                  <div className="message-content">{message.content}</div>
                </div>
              ))
            )}

            {loading && (
              <div className="chat-widget-message assistant">
                <div className="message-content typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}

            {error && (
              <div className="chat-widget-message error">
                <div className="message-content">⚠️ {error}</div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form className="chat-widget-input-form" onSubmit={handleSendMessage}>
            <input
              type="text"
              placeholder="Share your thoughts..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
              className="chat-widget-input"
            />
            <button
              type="submit"
              disabled={loading || !inputValue.trim()}
              className="chat-widget-send"
            >
              {loading ? '...' : '→'}
            </button>
          </form>

          {messages.length > 0 && (
            <button
              className="chat-widget-clear"
              onClick={clearHistory}
              title="Clear conversation history"
            >
              🗑️ Clear
            </button>
          )}
        </div>
      )}
    </>
  );
}
