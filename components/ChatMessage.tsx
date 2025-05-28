
import React from 'react';
import { ChatMessageData, MessageSender } from '../types';

const TypingIndicatorDots: React.FC = () => (
  <div className="flex space-x-1.5 items-center py-1"> {/* Adjusted spacing and padding */}
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce_1"></div>
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce_2"></div>
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce_3"></div>
  </div>
);

interface ChatMessageProps {
  message: ChatMessageData;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }: ChatMessageProps) => {
  const { text, sender, timestamp } = message;

  const isUser = sender === MessageSender.USER;
  const isBot = sender === MessageSender.BOT;
  const isTyping = sender === MessageSender.TYPING_INDICATOR;
  const isError = sender === MessageSender.ERROR;

  const timeString = timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  let containerClasses = 'flex w-full'; // Use w-full to allow content to determine width up to max-w
  let bubbleWrapperClasses = 'flex flex-col'; // To stack bubble and time correctly
  let bubbleClasses = 'py-2 px-4 rounded-xl max-w-md md:max-w-lg lg:max-w-xl break-words shadow-md';
  let textClasses = 'text-sm md:text-base'; // Responsive text size
  let timeClasses = 'text-xs mt-1';

  if (isUser) {
    containerClasses += ' justify-end pl-10 sm:pl-16'; // Add padding to left to not hit edge
    bubbleWrapperClasses += ' items-end';
    bubbleClasses += ' bg-blue-600 text-white';
    timeClasses += ' text-blue-200';
  } else if (isBot || isTyping) {
    containerClasses += ' justify-start pr-10 sm:pr-16'; // Add padding to right
    bubbleWrapperClasses += ' items-start';
    bubbleClasses += ' bg-gray-700 text-gray-100';
    timeClasses += ' text-gray-400';
     if (isTyping) {
       bubbleClasses += ' py-2 px-3'; // Adjusted padding for typing indicator
     }
  } else if (isError) {
    containerClasses += ' justify-start pr-10 sm:pr-16';
    bubbleWrapperClasses += ' items-start';
    bubbleClasses += ' bg-red-600 text-white';
    timeClasses += ' text-red-200';
  }

  return (
    <div className={containerClasses}>
      <div className={bubbleWrapperClasses}>
        <div className={bubbleClasses}>
          {isTyping ? <TypingIndicatorDots /> : <p className={textClasses}>{text}</p>}
        </div>
        {!isTyping && <p className={timeClasses}>{timeString}</p>}
      </div>
    </div>
  );
};
