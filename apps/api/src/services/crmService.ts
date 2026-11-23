/**
 * CRM Integration Service
 * Connectors for HubSpot, Salesforce, Zoho, and other CRM platforms
 */

import axios from 'axios';

export interface CRMContact {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  company?: string;
  tags?: string[];
  customFields?: Record<string, any>;
}

export interface CRMLead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'disqualified';
  source?: string;
  value?: number;
  notes?: string;
  createdAt: string;
}

export interface CRMIntegration {
  platform: 'hubspot' | 'salesforce' | 'zoho' | 'pipedrive' | 'custom';
  apiKey: string;
  apiUrl?: string;
  accessToken?: string;
  refreshToken?: string;
}

export class CRMService {
  private clients: Map<string, any> = new Map();
  private tokens: Map<string, string> = new Map();

  /**
   * Add a new CRM integration
   */
  addIntegration(botId: string, config: CRMIntegration) {
    const key = `${botId}:${config.platform}`;
    this.clients.set(key, this.createClient(config));
  }

  /**
   * Find or create a contact
   */
  async findOrCreateContact(
    botId: string,
    platform: string,
    contact: Partial<CRMLead>
  ): Promise<CRMLead> {
    const key = `${botId}:${platform}`;
    const client = this.clients.get(key);

    if (!client) {
      throw new Error(`No CRM connector found for bot ${botId} on platform ${platform}`);
    }

    return client.findOrCreateContact(contact);
  }

  /**
   * Search contacts
   */
  async searchContacts(
    botId: string,
    platform: string,
    query: string
  ): Promise<CRMLead[]> {
    const key = `${botId}:${platform}`;
    const client = this.clients.get(key);

    if (!client) {
      throw new Error(`No CRM connector found for bot ${botId} on platform ${platform}`);
    }

    return client.searchContacts(query);
  }

  /**
   * Create/update a contact
   */
  async upsertContact(
    botId: string,
    platform: string,
    contact: CRMLead
  ): Promise<CRMLead> {
    const key = `${botId}:${platform}`;
    const client = this.clients.get(key);

    if (!client) {
      throw new Error(`No CRM connector found for bot ${botId} on platform ${platform}`);
    }

    return client.upsertContact(contact);
  }

  /**
   * Create activity/note on contact
   */
  async logActivity(
    botId: string,
    platform: string,
    contactId: string,
    activity: {
      type: 'call' | 'email' | 'message' | 'meeting';
      subject: string;
      body: string;
      createdAt: string;
    }
  ): Promise<void> {
    const key = `${botId}:${platform}`;
    const client = this.clients.get(key);

    if (!client) {
      throw new Error(`No CRM connector found for bot ${botId} on platform ${platform}`);
    }

    return client.logActivity(contactId, activity);
  }

  /**
   * Create platform-specific client
   */
  private createClient(config: CRMIntegration) {
    switch (config.platform) {
      case 'hubspot':
        return new HubSpotClient(config);
      case 'salesforce':
        return new SalesforceClient(config);
      case 'zoho':
        return new ZohoClient(config);
      case 'pipedrive':
        return new PipedriveClient(config);
      default:
        throw new Error(`Unsupported CRM platform: ${config.platform}`);
    }
  }
}

/**
 * HubSpot API Client
 */
class HubSpotClient {
  private apiKey: string;
  private baseUrl = 'https://api.hubapi.com/crm/v3';

  constructor(private config: CRMIntegration) {
    this.apiKey = config.apiKey || '';
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  async findOrCreateContact(contact: Partial<CRMLead>): Promise<CRMLead> {
    if (!contact.email) {
      throw new Error('Email is required for HubSpot contact');
    }

    // Try to find existing contact
    try {
      const response = await axios.get(
        `${this.baseUrl}/objects/contacts/search`,
        {
          headers: this.getHeaders(),
          data: {
            filterGroups: [{
              filters: [{
                propertyName: 'email',
                operator: 'EQ',
                value: contact.email,
              }],
            }],
          },
        }
      );

      if (response.data.results?.length > 0) {
        const existing = response.data.results[0];
        return this.formatContact(existing);
      }
    } catch (error) {
      // Contact doesn't exist, create new
    }

    // Create new contact
    const response = await axios.post(
      `${this.baseUrl}/objects/contacts`,
      {
        properties: {
          email: contact.email,
          firstname: contact.firstName,
          lastname: contact.lastName,
          phone: contact.phone,
          company: contact.company,
          lead_source: contact.source,
        },
      },
      { headers: this.getHeaders() }
    );

    return this.formatContact(response.data);
  }

  async searchContacts(query: string): Promise<CRMLead[]> {
    const response = await axios.post(
      `${this.baseUrl}/objects/contacts/search`,
      {
        filterGroups: [{
          filters: [{
            propertyName: 'email',
            operator: 'HAS_PROPERTY',
            value: query,
          }],
        }],
        limit: 100,
      },
      { headers: this.getHeaders() }
    );

    return response.data.results.map((c: any) => this.formatContact(c));
  }

  async upsertContact(contact: CRMLead): Promise<CRMLead> {
    // Use findOrCreateContact logic
    return this.findOrCreateContact({
      ...contact,
      createdAt: new Date().toISOString(),
    });
  }

  async logActivity(
    contactId: string,
    activity: { type: 'call' | 'email' | 'message' | 'meeting'; subject: string; body: string; createdAt: string; }
  ): Promise<void> {
    await axios.post(
      `${this.baseUrl}/activities/engagements`,
      {
        activityType: activity.type.toUpperCase() as 'CALL' | 'EMAIL' | 'MEETING',
        associations: {
          contactIds: [contactId],
          pipelineIds: [],
        },
        body: activity.body,
        subject: activity.subject,
        timestamp: new Date(activity.createdAt).getTime(),
      },
      { headers: this.getHeaders() }
    );
  }

  private formatContact(contact: any): CRMLead {
    return {
      id: contact.id,
      name: `${contact.properties.firstname || ''} ${contact.properties.lastname || ''}`.trim(),
      email: contact.properties.email,
      phone: contact.properties.phone,
      company: contact.properties.company,
      status: 'new' as const,
      source: contact.properties.lead_source,
      createdAt: contact.properties.createdate,
      tags: contact.properties.tags?.split(',') || [],
    };
  }
}

/**
 * Salesforce API Client
 */
class SalesforceClient {
  private baseUrl = 'https://your-instance.salesforce.com/services/data/v58.0';
  private accessToken: string;

  constructor(private config: CRMIntegration) {
    this.accessToken = config.accessToken || '';
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
    };
  }

  async findOrCreateContact(contact: Partial<CRMLead>): Promise<CRMLead> {
    // Search for existing contact
    const search = contact.email
      ? `SELECT Id, Name, Email, Phone, Company, Status__c FROM Lead WHERE Email = '${contact.email}'`
      : `SELECT Id, Name, Email, Phone, Company, Status__c FROM Lead LIMIT 1`;

    try {
      const response = await axios.get(
        `${this.baseUrl}/query?q=${encodeURIComponent(search)}`,
        { headers: this.getHeaders() }
      );

      if (response.data.records?.length > 0) {
        return this.formatContact(response.data.records[0]);
      }
    } catch (error) {
      // Contact doesn't exist
    }

    // Create new lead
    const response = await axios.post(
      `${this.baseUrl}/sobjects/Lead`,
      {
        FirstName: contact.firstName,
        LastName: contact.lastName,
        Email: contact.email,
        Phone: contact.phone,
        Company: contact.company,
        LeadSource: contact.source,
        Status: 'New',
      },
      { headers: this.getHeaders() }
    );

    return {
      id: response.data.id,
      name: `${contact.firstName || ''} ${contact.lastName || ''}`.trim(),
      email: contact.email || '',
      phone: contact.phone,
      company: contact.company,
      status: 'new' as const,
      source: contact.source,
      createdAt: new Date().toISOString(),
    };
  }

  async searchContacts(query: string): Promise<CRMLead[]> {
    const response = await axios.get(
      `${this.baseUrl}/query?q=${encodeURIComponent(
        `SELECT Id, Name, Email, Phone, Company, Status__c FROM Lead WHERE Name LIKE '%${query}%' OR Email LIKE '%${query}%'`
      )}`,
      { headers: this.getHeaders() }
    );

    return response.data.records.map((c: any) => this.formatContact(c));
  }

  async logActivity(
    contactId: string,
    activity: { type: 'call' | 'email' | 'message' | 'meeting'; subject: string; body: string; createdAt: string; }
  ): Promise<void> {
    await axios.post(
      `${this.baseUrl}/sobjects/Task`,
      {
        WhatId: contactId,
        Subject: activity.subject,
        Comments: activity.body,
        Status: 'Completed',
        ActivityDate: new Date(activity.createdAt).toISOString().split('T')[0],
      },
      { headers: this.getHeaders() }
    );
  }

  private formatContact(contact: any): CRMLead {
    return {
      id: contact.Id,
      name: contact.Name,
      email: contact.Email,
      phone: contact.Phone,
      company: contact.Company,
      status: (contact.Status__c || 'new') as any,
      createdAt: contact.CreatedDate,
    };
  }
}

/**
 * Zoho CRM API Client
 */
class ZohoClient {
  private baseUrl = 'https://www.zohoapis.com/crm/v2';
  private accessToken: string;

  constructor(private config: CRMIntegration) {
    this.accessToken = config.accessToken || '';
  }

  private getHeaders() {
    return {
      'Authorization': `Zoho-oauthtoken ${this.accessToken}`,
      'Content-Type': 'application/json',
    };
  }

  async findOrCreateContact(contact: Partial<CRMLead>): Promise<CRMLead> {
    // Search for existing contact
    try {
      const response = await axios.get(
        `${this.baseUrl}/Contacts?search_formula=${encodeURIComponent(
          `(Email = "${contact.email}")`
        )}`,
        { headers: this.getHeaders() }
      );

      if (response.data.data?.length > 0) {
        return this.formatContact(response.data.data[0]);
      }
    } catch (error) {
      // Contact doesn't exist
    }

    // Create new contact
    const response = await axios.post(
      `${this.baseUrl}/Contacts`,
      {
        data: [{
          First_Name: contact.firstName,
          Last_Name: contact.lastName,
          Email: contact.email,
          Phone: contact.phone,
          Company: contact.company,
          Lead_Source: contact.source,
        }],
      },
      { headers: this.getHeaders() }
    );

    return this.formatContact(response.data.data[0]);
  }

  async searchContacts(query: string): Promise<CRMLead[]> {
    const response = await axios.get(
      `${this.baseUrl}/Contacts?search_formula=${encodeURIComponent(
        `(First_Name includes "${query}" or Last_Name includes "${query}" or Email includes "${query}")`
      )}`,
      { headers: this.getHeaders() }
    );

    return response.data.data.map((c: any) => this.formatContact(c));
  }

  async logActivity(
    contactId: string,
    activity: { type: 'call' | 'email' | 'message' | 'meeting'; subject: string; body: string; createdAt: string; }
  ): Promise<void> {
    await axios.post(
      `${this.baseUrl}/Events`,
      {
        data: [{
          Subject: activity.subject,
          Description: activity.body,
          Start_Time: activity.createdAt,
          End_Time: new Date(Date.now() + 3600000).toISOString(),
          Related_To: contactId,
          Event_Type: activity.type === 'call' ? 'Call' : 'Meeting',
        }],
      },
      { headers: this.getHeaders() }
    );
  }

  private formatContact(contact: any): CRMLead {
    return {
      id: contact.id,
      name: `${contact.first_name || ''} ${contact.last_name || ''}`.trim(),
      email: contact.email,
      phone: contact.phone,
      company: contact.company,
      status: (contact.lead_status || 'new') as any,
      createdAt: contact.created_time,
      tags: contact.tag_name?.split(',') || [],
    };
  }
}

/**
 * Pipedrive API Client
 */
class PipedriveClient {
  private baseUrl = 'https://api.pipedrive.com/v1';
  private apiToken: string;

  constructor(private config: CRMIntegration) {
    this.apiToken = config.apiKey || '';
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
    };
  }

  private getUrl(endpoint: string) {
    return `${this.baseUrl}/${endpoint}?api_token=${this.apiToken}`;
  }

  async findOrCreateContact(contact: Partial<CRMLead>): Promise<CRMLead> {
    // Search for existing contact
    try {
      const response = await axios.get(
        this.getUrl(`persons/search?query=${encodeURIComponent(contact.email || '')}`),
        { headers: this.getHeaders() }
      );

      if (response.data.data?.items?.length > 0) {
        return this.formatContact(response.data.data.items[0].item);
      }
    } catch (error) {
      // Contact doesn't exist
    }

    // Create new contact
    const response = await axios.get(
      this.getUrl(`persons?name=${encodeURIComponent(
        `${contact.firstName || ''} ${contact.lastName || ''}`.trim()
      )}&email=${contact.email || ''}`),
      { headers: this.getHeaders() }
    );

    return this.formatContact(response.data.data[0]);
  }

  async searchContacts(query: string): Promise<CRMLead[]> {
    const response = await axios.get(
      this.getUrl(`persons?search_text=${encodeURIComponent(query)}`),
      { headers: this.getHeaders() }
    );

    return response.data.data.map((c: any) => this.formatContact(c));
  }

  async logActivity(
    contactId: string,
    activity: { type: 'call' | 'email' | 'message' | 'meeting'; subject: string; body: string; createdAt: string; }
  ): Promise<void> {
    await axios.post(
      this.getUrl('activities'),
      {
        activity_type: activity.type === 'call' ? 1 : 2, // Call or Meeting
        subject: activity.subject,
        body: activity.body,
        person_id: contactId,
        due_date: new Date(activity.createdAt).toISOString().split('T')[0],
      },
      { headers: this.getHeaders() }
    );
  }

  private formatContact(contact: any): CRMLead {
    return {
      id: contact.id?.toString() || '',
      name: contact.name || '',
      email: contact.email?.[0]?.value || '',
      phone: contact.phone?.[0]?.value || '',
      company: contact.org_id?.name || '',
      status: 'new' as const,
      createdAt: contact.add_time || new Date().toISOString(),
    };
  }
}

export const crmService = new CRMService();