
import { N8N_WEBHOOK_URL } from '../constants';
import { N8NBotResponse } from '../types';

export async function sendMessageToN8N(userMessage: string, sessionId: string): Promise<string> {
  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/plain',
      },
      // Align payload with the working HTML example
      body: JSON.stringify({ mensaje: userMessage, sessionId: sessionId }),
    });

    let responseText = '';
    try {
      responseText = await response.text();
    } catch (textError) {
      console.error(`Error reading response text from N8N: ${textError instanceof Error ? textError.message : String(textError)}`);
      if (!response.ok) {
        throw new Error(`The bot service returned an error (status ${response.status}) and the response body could not be read.`);
      }
      throw new Error('Failed to read the response from the bot service.');
    }

    if (!response.ok) {
      console.error(`N8N API Error: ${response.status} ${response.statusText}. Body: ${responseText}`);
      let errorMessage = responseText || response.statusText;
      try {
        const jsonError = JSON.parse(responseText);
        errorMessage = jsonError.error?.message || jsonError.message || responseText;
      } catch (e) {
        // Ignore if parsing fails, use responseText or statusText
      }
      throw new Error(`The bot service returned an error (status ${response.status}): ${errorMessage}`);
    }

    if (responseText.trim() === '') {
      console.warn("N8N returned an empty response body (status OK). Interpreting as no specific reply.");
      return "The bot didn't provide a specific response this time.";
    }

    const contentType = response.headers.get('content-type');
    let determinedReply: string | undefined;

    if (contentType && contentType.toLowerCase().includes('application/json')) {
      try {
        const data: N8NBotResponse = JSON.parse(responseText);
        
        // Prioritize 'output' as per the working HTML example
        if (typeof data.output === 'string' && data.output.trim() !== '') {
          determinedReply = data.output.trim();
        } else if (typeof data.reply === 'string' && data.reply.trim() !== '') {
          determinedReply = data.reply.trim();
        } else if (typeof data.answer === 'string' && data.answer.trim() !== '') {
          determinedReply = data.answer.trim();
        } else {
          // Fallback to find any other non-empty string field if 'output', 'reply', or 'answer' are not found or empty
          const firstStringValue = Object.values(data).find(
            value => typeof value === 'string' && (value as string).trim() !== ''
          );
          if (typeof firstStringValue === 'string') {
            determinedReply = (firstStringValue as string).trim();
          }
        }
        
        if (!determinedReply) {
            console.warn("N8N JSON response did not contain a non-empty 'output', 'reply', 'answer', or any other usable non-empty string field:", data);
            throw new Error('The bot sent a JSON response, but it contained no usable text.');
        }

      } catch (parseError) {
        console.error("Failed to parse N8N JSON response. Raw response text:", responseText, parseError);
        throw new Error(`The bot's JSON response was malformed. Raw response: "${responseText.substring(0, 150)}${responseText.length > 150 ? '...' : ''}"`);
      }
    } else {
      // If not JSON, treat the whole response text as the reply
      determinedReply = responseText.trim();
    }

    if (!determinedReply) { 
        console.warn("Processed bot reply is empty. Original response text:", responseText);
        throw new Error('The bot returned an empty or unprocessable response.');
    }
    
    return determinedReply;

  } catch (error) {
    console.error('Error in sendMessageToN8N:', error); 

    if (error instanceof Error) {
      const specificErrorMessages = [
        'The bot service returned an error',
        "The bot's JSON response was malformed",
        'The bot sent a JSON response, but it contained no usable text',
        'The bot returned an empty or unprocessable response',
        'Failed to read the response from the bot service',
      ];
      if (specificErrorMessages.some(msg => error.message.startsWith(msg))) {
        throw error;
      }
      throw new Error(`Failed to connect to the bot. Please check your internet connection or the bot service. (Details: ${error.message})`);
    }
    throw new Error(`An unknown error occurred while contacting the bot. (Details: ${String(error)})`);
  }
}
