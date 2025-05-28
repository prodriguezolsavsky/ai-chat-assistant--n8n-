
export enum MessageSender {
  USER = 'user',
  BOT = 'bot',
  TYPING_INDICATOR = 'typing_indicator',
  ERROR = 'error',
}

export interface ChatMessageData {
  id: string;
  text: string;
  sender: MessageSender;
  timestamp: Date;
}

export interface N8NBotResponse {
  output?: string; // Added based on working HTML example
  reply?: string;
  answer?: string;
  // Allow other potential string fields as a fallback
  [key: string]: any;
}
