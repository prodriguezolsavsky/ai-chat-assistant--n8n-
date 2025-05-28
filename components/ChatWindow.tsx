
import React, { useEffect, useRef } from 'react';
import { ChatMessageData } from '../types';
import { ChatMessage } from './ChatMessage';

interface ChatWindowProps {
  messages: ChatMessageData[];
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ messages }: ChatWindowProps) => {
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current && chatContainerRef.current) {
      // Scroll to bottom smoothly
      // Check if user is scrolled up slightly, if so, don't auto-scroll aggressively
      // This is a common UX pattern but for simplicity, always scroll for now
      chatEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages]);

  return (
    <div ref={chatContainerRef} className="flex-grow overflow-y-auto p-4 sm:p-6 space-y-4 bg-gray-900">
      {messages.map((msg: ChatMessageData) => (
        <ChatMessage key={msg.id} message={msg} />
      ))}
      <div ref={chatEndRef} style={{ height: '1px' }} /> {/* Invisible element to scroll to */}
    </div>
  );
};
