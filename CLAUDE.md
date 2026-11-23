# OmniTalk - WhatsApp Business Platform

A platform for building WhatsApp automations, AI agents, and campaigns - similar to hello-charles.com

## Architecture

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────────────────┐
│                        WEB DASHBOARD                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐      │
│  │ Flow Builder    │  │ Bot Manager     │  │ Analytics       │      │
│  │ Visual Editor   │  │ A/B Testing     │  │ Metrics         │      │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘      │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    API GATEWAY & AUTH                                │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐      │
│  │ API Gateway     │  │ JWT Auth        │  │ Rate Limiting   │      │
│  │ Load Balancer   │  │ OAuth2          │  │ Request Queuing │      │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘      │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    ORCHESTRATION LAYER                               │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐      │
│  │ Webhook Handler │  │ Message Router  │  │ AI Router       │      │
│  │ Signature Verif │  │ Flow Executor   │  │ LLM Selector    │      │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘      │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    BUSINESS LOGIC LAYER                                │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐      │
│  │ Conversation    │  │ Flow Engine     │  │ AI Agents       │      │
│  │ State Manager   │  │ Bot Runner      │  │ GPT/Claude      │      │
│  │ Context Store   │  │ Campaign Mgr    │  │ Prompt Engine   │      │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘      │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    INTEGRATION LAYER                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐      │
│  │ WhatsApp API    │  │ E-commerce      │  │ CRM Systems     │      │
│  │ Webhook         │  │ Shopify, Woo    │  │ HubSpot, SF     │      │
│  │ Message Sender  │  │ Inventory       │  │ Customer Data   │      │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘      │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    DATA LAYER                                        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐      │
│  │ PostgreSQL      │  │ Redis Cache     │  │ Message Queue   │      │
│  │ User Data       │  │ Session State   │  │ Async Tasks     │      |
│  │ Bot Configs     │  │ Rate Limits     │  │ Events Stream   │      │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘      │
└─────────────────────────────────────────────────────────────────────┘
```

## Key Features

1. **Visual Flow Builder** - Drag-and-drop interface for creating WhatsApp automations
2. **AI Agent Framework** - Support for multiple LLM providers (GPT, Claude, etc.)
3. **Multi-channel Support** - WhatsApp Business API, Messenger, RCS, Email
4. **E-commerce Integration** - Shopify, WooCommerce, Magento APIs
5. **CRM Sync** - HubSpot, Salesforce, Zoho integration
6. **Analytics Dashboard** - Real-time metrics and conversion tracking

## Technology Stack

### Backend
- **Node.js** - JavaScript runtime
- **TypeScript** - Type safety
- **Express.js** - REST API framework
- **Socket.io** - Real-time communication
- **PostgreSQL** - Primary database
- **Redis** - Caching and session management
- **RabbitMQ/Kafka** - Message queue

### Frontend
- **React** - UI framework
- **Tailwind CSS** - Styling
- **D3.js** - Analytics visualizations
- **React Flow** - Visual builder

### AI/ML
- **OpenAI SDK** - GPT integration
- **Anthropic SDK** - Claude integration
- **LangChain** - LLM orchestration

### Infrastructure
- **Docker** - Containerization
- **Kubernetes** - Orchestration
- **Nginx** - Reverse proxy
- **PM2** - Process management

## Project Structure

```
OmniTalk/
├── apps/
│   ├── api/              # Main API server
│   ├── web/              # Dashboard frontend
│   └── worker/           # Background job processor
├── packages/
│   ├── core/             # Shared business logic
│   ├── ai/               # AI agent framework
│   ├── flows/            # Flow engine
│   └── whatsapp/         # WhatsApp connector
├── shared/
│   ├── types/            # Shared types
│   └── utils/            # Shared utilities
├── services/
│   ├── auth/             # Authentication service
│   ├── database/         # Database service
│   └── cache/            # Cache service
└── docker-compose.yml    # Development environment
```

## Implementation Priority

1. **Phase 1 - Core Infrastructure** (Weeks 1-2)
   - Project setup with monorepo
   - Database schema and migrations
   - Authentication system
   - WhatsApp webhook handler

2. **Phase 2 - API & Basic Features** (Weeks 3-4)
   - REST API endpoints
   - Bot CRUD operations
   - Message routing
   - Basic conversation flow

3. **Phase 3 - AI Integration** (Weeks 5-6)
   - LLM providers integration
   - Prompt management system
   - AI agent router
   - Context memory system

4. **Phase 4 - Dashboard** (Weeks 7-8)
   - React frontend
   - Flow builder UI
   - Analytics dashboard
   - Bot management

5. **Phase 5 - Integrations** (Weeks 9-10)
   - E-commerce connectors
   - CRM integrations
   - Analytics tracking
   - Webhooks system