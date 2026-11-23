/**
 * WhatsApp Service
 * Handles communication with Meta WhatsApp Business API
 */

import axios from 'axios';

interface WhatsAppMessage {
  to: string;
  type: string;
  content?: any;
  template?: {
    name: string;
    language: string;
    components?: any[];
  };
}

interface WhatsAppResponse {
  messages?: Array<{ id: string }>;
  errors?: Array<{ code: number; title: string; message: string; type: string }>;
}

export class WhatsAppService {
  private accessToken: string;
  private phoneNumberId: string;
  private baseUrl: string;

  constructor() {
    this.accessToken = process.env.META_ACCESS_TOKEN || '';
    this.phoneNumberId = process.env.META_PHONE_NUMBER_ID || '';
    this.baseUrl = `https://graph.facebook.com/v19.0/${this.phoneNumberId}`;
  }

  /**
   * Send a text message
   */
  async sendText(to: string, text: string): Promise<string> {
    const response = await this.send({
      to,
      type: 'text',
      content: { body: text },
    });

    return response.messages?.[0]?.id || '';
  }

  /**
   * Send a template message
   */
  async sendTemplate(
    to: string,
    templateName: string,
    language = 'en',
    components: any[] = []
  ): Promise<string> {
    const response = await this.send({
      to,
      type: 'template',
      template: {
        name: templateName,
        language,
        components,
      },
    });

    return response.messages?.[0]?.id || '';
  }

  /**
   * Send an image message
   */
  async sendImage(to: string, imageUrl: string, caption?: string): Promise<string> {
    const response = await this.send({
      to,
      type: 'image',
      content: { link: imageUrl, caption },
    });

    return response.messages?.[0]?.id || '';
  }

  /**
   * Send a video message
   */
  async sendVideo(to: string, videoUrl: string, caption?: string): Promise<string> {
    const response = await this.send({
      to,
      type: 'video',
      content: { link: videoUrl, caption },
    });

    return response.messages?.[0]?.id || '';
  }

  /**
   * Send a quick reply template
   */
  async sendQuickReply(
    to: string,
    text: string,
    buttons: Array<{ type: 'reply'; text: string; id: string }>
  ): Promise<string> {
    const response = await this.send({
      to,
      type: 'interactive',
      content: {
        type: 'button',
        body: { text },
        action: {
          buttons: buttons.map((btn) => ({
            type: 'reply',
            reply: { id: btn.id, title: btn.text },
          })),
        },
      },
    });

    return response.messages?.[0]?.id || '';
  }

  /**
   * Send a generic message
   */
  async sendMessage(to: string, type: string, content: any): Promise<string> {
    return this.send({ to, type, content });
  }

  /**
   * Send message to WhatsApp API
   */
  private async send(message: WhatsAppMessage): Promise<WhatsAppResponse> {
    if (!this.accessToken) {
      throw new Error('Meta access token not configured');
    }

    try {
      const payload: any = {
        messaging_product: 'whatsapp',
        to: message.to,
      };

      if (message.type === 'text') {
        payload.text = message.content;
      } else if (message.type === 'template') {
        payload.template = message.template;
      } else if (message.type === 'image') {
        payload.image = message.content;
      } else if (message.type === 'video') {
        payload.video = message.content;
      } else if (message.type === 'interactive') {
        payload.interactive = message.content;
      }

      const response = await axios.post(
        this.baseUrl,
        payload,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      return response.data;
    } catch (error) {
      console.error('WhatsApp API error:', error);
      throw error;
    }
  }

  /**
   * Get message status
   */
  async getMessageStatus(messageId: string): Promise<string> {
    try {
      const response = await axios.get(
        `https://graph.facebook.com/v19.0/${messageId}`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      );

      return response.data.status;
    } catch (error) {
      console.error('Get message status error:', error);
      return 'error';
    }
  }
}

export const whatsappService = new WhatsAppService();