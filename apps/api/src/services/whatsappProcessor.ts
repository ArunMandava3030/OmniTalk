/**
 * WhatsApp Message Processor
 * Processes incoming messages and routes to appropriate AI agents
 */

import { redis } from './database';
import { whatsappService } from './whatsappService';

interface MessageData {
  id: string;
  from: string;
  to: string;
  type: string;
  text?: string;
  attachments?: any;
  bot: any;
  conversationState: any;
}

export async function processWhatsAppMessage(message: MessageData): Promise<void> {
  const { from, to, text, type, bot, conversationState } = message;

  // Get AI agent based on bot configuration
  const agent = await getAgentForBot(bot.id);

  // Generate response using AI
  const response = await generateResponse({
    from,
    to,
    text: text || '',
    conversationState,
    bot,
    agent,
  });

  // Send response
  if (response.message) {
    await whatsappService.sendMessage(to, 'text', { body: response.message });
  }

  // Update conversation state
  if (conversationState) {
    const sessionId = `session:${from}:${bot.id}`;
    await redis.setex(sessionId, 3600, JSON.stringify(conversationState));
  }
}

/**
 * Get AI agent configuration for a bot
 */
async function getAgentForBot(botId: string): Promise<any> {
  // This would fetch AI agent configuration from database
  const config = await redis.get(`ai_config:${botId}`);
  return config ? JSON.parse(config) : getDefaultConfig();
}

/**
 * Generate response using AI
 */
async function generateResponse(params: any): Promise<{ message?: string }> {
  const { from, text, conversationState, bot, agent } = params;

  // Simple rule-based response for now
  // In production, this would call an LLM (GPT, Claude, etc.)
  if (text?.toLowerCase().includes('hello') || text?.toLowerCase().includes('hi')) {
    return { message: bot.greeting_message || 'Hello! How can I help you today?' };
  }

  if (text?.toLowerCase().includes('menu') || text?.toLowerCase().includes('help')) {
    return { message: 'Here are the things I can help you with:\n1. Check order status\n2. Place a new order\n3. Get support' };
  }

  // Default fallback response
  return { message: "I'm sorry, I didn't understand that. Can you please rephrase?" };
}

/**
 * Get default agent configuration
 */
function getDefaultConfig(): any {
  return {
    provider: 'openai',
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 1000,
    systemPrompt: 'You are a helpful customer service agent for a WhatsApp business bot.',
  };
}

/**
 * Process message queue worker
 */
export async function startMessageProcessor(): Promise<void> {
  console.log('Starting WhatsApp message processor...');

  // Simple polling approach - in production use proper message queue
  setInterval(async () => {
    try {
      const message = await redis.brpop('message_queue', 1);
      if (message) {
        const messageData = JSON.parse(message[1]);
        await processWhatsAppMessage(messageData);
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  }, 1000);
}