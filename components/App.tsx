
import React, { useState, useEffect, useCallback } from 'react';
import { ChatMessageData, MessageSender } from '../types'; // Corrected path
import { ChatWindow } from './ChatWindow'; // Corrected path
import { ChatInput } from './ChatInput'; // Corrected path
import { sendMessageToN8N } from '../services/n8nService'; // Corrected path

const TYPING_INDICATOR_ID = 'typing-indicator-message';

// Define helper outside to prevent re-creation on App re-render
const createMessage = (text: string, sender: MessageSender): ChatMessageData => ({
  id: Date.now().toString(36) + Math.random().toString(36).substring(2), // More robust unique ID
  text,
  sender,
  timestamp: new Date(),
});

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    let sid = sessionStorage.getItem('chatSessionId');
    if (!sid) {
      sid = Date.now().toString(36) + Math.random().toString(36).substring(2);
      sessionStorage.setItem('chatSessionId', sid);
    }
    setSessionId(sid);

    // Initial welcome message
    setMessages([
      createMessage("Hello! I'm your AI assistant. How can I help you today?", MessageSender.BOT)
    ]);
  }, []); // Empty dependency array means this runs once on mount

  const addMessageToList = useCallback((newMessage: ChatMessageData) => {
    setMessages((prevMessages: ChatMessageData[]) => [...prevMessages, newMessage]);
  }, []);
  
  const showTypingIndicator = useCallback(() => {
    setMessages((prev: ChatMessageData[]) => {
      const filtered = prev.filter((m: ChatMessageData) => m.id !== TYPING_INDICATOR_ID);
      const newTypingMessage = createMessage('Bot is typing...', MessageSender.TYPING_INDICATOR);
      newTypingMessage.id = TYPING_INDICATOR_ID; 
      return [...filtered, newTypingMessage];
    });
  }, []);

  const removeTypingIndicator = useCallback(() => {
    setMessages((prev: ChatMessageData[]) => prev.filter((m: ChatMessageData) => m.id !== TYPING_INDICATOR_ID));
  }, []);

  const handleSendMessage = useCallback(async (userMessageText: string) => {
    if (!sessionId) {
      console.error("Session ID not available. Cannot send message.");
      addMessageToList(createMessage("Error: Session ID is missing. Please refresh the page.", MessageSender.ERROR));
      setIsLoading(false);
      return;
    }

    addMessageToList(createMessage(userMessageText, MessageSender.USER));
    setIsLoading(true);
    showTypingIndicator();

    try {
      const botResponseText = await sendMessageToN8N(userMessageText, sessionId);
      removeTypingIndicator();
      addMessageToList(createMessage(botResponseText, MessageSender.BOT));
    } catch (error) {
      removeTypingIndicator();
      const errorMessageText = error instanceof Error ? error.message : 'An unexpected error occurred.';
      addMessageToList(createMessage(errorMessageText, MessageSender.ERROR));
      console.error("Error handling send message:", error);
    } finally {
      setIsLoading(false);
    }
  }, [addMessageToList, showTypingIndicator, removeTypingIndicator, sessionId]);

  return (
    <div className="flex flex-col h-full max-h-screen bg-gray-900 text-white sm:max-w-2xl md:max-w-3xl mx-auto sm:shadow-2xl sm:rounded-lg sm:my-4 overflow-hidden">
      <header className="bg-gray-800 p-4 text-lg sm:text-xl font-semibold text-center shadow-md flex-shrink-0">
        AI Chat Assistant
      </header>
      <ChatWindow messages={messages} />
      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  );
};

export default App;
