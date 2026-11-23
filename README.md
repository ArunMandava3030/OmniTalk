# OmniTalk - WhatsApp Business Platform

A comprehensive platform for building WhatsApp automations, AI agents, and campaigns - similar to [hello-charles.com](https://www.hello-charles.com/).

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/ArunMandava3030/OmniTalk/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Docker](https://img.shields.io/badge/docker-ready-blue.svg)](https://hub.docker.com/)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or Docker
- PostgreSQL 14+
- Redis 6+
- Meta WhatsApp Business API credentials

### Docker Deployment (Recommended)

```bash
# 1. Clone the repository
git clone https://github.com/ArunMandava3030/OmniTalk.git
cd OmniTalk

# 2. Create environment file
cp apps/api/.env.example apps/api/.env

# 3. Configure your credentials in apps/api/.env
# Get credentials from https://developers.facebook.com/

# 4. Start all services
docker-compose up -d

# 5. Apply database migrations
docker-compose exec api npm run migrate

# 6. Open in browser
# API: http://localhost:3001
# Dashboard: http://localhost:3000
```

### Local Development

```bash
# Install dependencies
npm install

# Install workspace dependencies
npm run install:workspaces

# Set environment variables
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# Start development servers
npm run dev
```

## 📚 Documentation

### Table of Contents
- [Architecture](#architecture)
- [Features](#features)
- [API Reference](#api-reference)
- [WhatsApp Integration](#whatsapp-integration)
- [E-commerce Integrations](#ecommerce-integrations)
- [CRM Sync](#crm-sync)
- [Setup Guide](#setup-guide)
- [Deployment](#deployment)

### Architecture

OmniTalk follows a layered microservices architecture:

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
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    ORCHESTRATION LAYER                               │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐      │
│  │ Webhook Handler │  │ Message Router  │  │ AI Router       │      │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘      │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    BUSINESS LOGIC LAYER                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐      │
│  │ Flow Engine     │  │ AI Agents       │  │ Conversation    │      │
│  │ Bot Runner      │  │ GPT/Claude      │  │ State Manager   │      │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘      │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    INTEGRATION LAYER                               │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐      │
│  │ WhatsApp API    │  │ E-commerce      │  │ CRM Systems     │      │
│  │ Shopify, Woo    │  │ HubSpot, SF     │  │                 │      │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘      │
└─────────────────────────────────────────────────────────────────────┘
```

## Features

### ✅ Dashboard & Builder
- **Visual Flow Builder** - Drag-and-drop interface for creating WhatsApp automations
- **Bot Management** - Create, configure, and manage multiple bots
- **Analytics Dashboard** - Real-time metrics and performance tracking

### ✅ WhatsApp Business API
- **Message Routing** - Intelligent message routing based on conversation state
- **Webhook Handling** - Secure signature verification and message processing
- **Media Support** - Send images, videos, documents, and interactive messages

### ✅ AI Agent Framework
- **Multiple LLM Providers** - OpenAI GPT, Anthropic Claude, Google PaLM
- **Prompt Management** - Dynamic prompt templates with context
- **Conversation Memory** - State management across conversations

### ✅ E-commerce Integrations
- **Shopify** - Full Shopify store integration
- **WooCommerce** - WordPress e-commerce support
- **Magento** - Enterprise e-commerce platform
- **Custom APIs** - REST API integration for any platform

### ✅ CRM Integrations
- **HubSpot** - Contact and deal management
- **Salesforce** - Enterprise CRM integration
- **Zoho CRM** - Small business CRM
- **Pipedrive** - Sales pipeline management

### ✅ Multi-Channel Support
- WhatsApp Business API (primary)
- Facebook Messenger
- Instagram Direct
- RCS (Rich Communication Services)
- Email

## API Reference

### Authentication

All API routes (except `/webhook` and `/auth`) require JWT authentication.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/me` | Get current user |

### Bot Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bots` | List all bots |
| POST | `/api/bots` | Create new bot |
| GET | `/api/bots/:id` | Get bot details |
| PATCH | `/api/bots/:id` | Update bot |
| DELETE | `/api/bots/:id` | Delete bot |

### Flow Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/flows` | List flows |
| POST | `/api/flows` | Create flow |
| GET | `/api/flows/:id` | Get flow |
| PATCH | `/api/flows/:id` | Update flow |
| DELETE | `/api/flows/:id` | Delete flow |

### Message Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/messages` | Send message |
| GET | `/api/messages` | List messages |

### E-commerce

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ecommerce/stores` | Add store connector |
| GET | `/api/ecommerce/products` | Get products |
| POST | `/api/ecommerce/orders` | Create order |
| GET | `/api/ecommerce/orders/:id` | Get order status |

### CRM

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/crm/integrations` | Add CRM integration |
| GET | `/api/crm/contacts` | Search contacts |
| POST | `/api/crm/contacts` | Create/update contact |
| POST | `/api/crm/contacts/:id/activity` | Log activity |

### Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics` | Get analytics overview |
| GET | `/api/analytics/messages` | Message chart data |
| GET | `/api/analytics/paths` | Conversation paths |
| POST | `/api/analytics/events` | Log event |

## WhatsApp Integration

### Setup Steps

1. **Create Meta Developer Account**
   - Go to [Meta for Developers](https://developers.facebook.com/)
   - Create an app with WhatsApp Business Platform product

2. **Configure Webhook**
   - URL: `https://your-domain.com/webhook`
   - Verify Token: Set in `.env` file
   - Subscription fields: `messages`, `message_templates`, `statuses`

3. **Get Credentials**
   ```env
   META_ACCESS_TOKEN=your_access_token
   META_PHONE_NUMBER_ID=your_phone_number_id
   META_VERIFY_TOKEN=your_verify_token
   ```

### Webhook Endpoint

```
POST /webhook
GET /webhook
```

### Message Types Supported

- Text messages
- Images
- Videos
- Documents
- Audio
- Templates
- Interactive buttons
- List messages

## E-commerce Integrations

### Shopify Setup

```env
# In .env file
SHOPIFY_API_KEY=your_api_key
SHOPIFY_PASSWORD=your_password
SHOPIFY_STORE=your-store.myshopify.com
```

### WooCommerce Setup

```env
# In .env file
WOOCOMMERCE_API_KEY=your_consumer_key
WOOCOMMERCE_API_SECRET=your_consumer_secret
WOOCOMMERCE_URL=https://your-store.com
```

### Magento Setup

```env
# In .env file
MAGENTO_ACCESS_TOKEN=your_access_token
MAGENTO_URL=https://your-store.com
```

## CRM Sync

### HubSpot Integration

```env
# In .env file
HUBSPOT_API_KEY=your_private_app_key
```

### Salesforce Integration

```env
# In .env file
SALESFORCE_ACCESS_TOKEN=your_jwt_token
SALESFORCE_INSTANCE=salesforce.com
```

### Zoho Integration

```env
# In .env file
ZOHO_ACCESS_TOKEN=your_oauth_token
```

## Setup Guide

### 1. Environment Configuration

Copy the example file and configure:

```bash
cp apps/api/.env.example apps/api/.env
```

**Required Variables:**
- `META_ACCESS_TOKEN` - Your Meta WhatsApp Business API access token
- `META_PHONE_NUMBER_ID` - WhatsApp Business phone number ID
- `META_VERIFY_TOKEN` - Webhook verification token

**Optional Variables:**
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` - Database connection
- `REDIS_HOST`, `REDIS_PORT` - Redis connection
- `JWT_SECRET` - JWT signing secret

### 2. Database Setup

```bash
# Create database and user
createdb omnitalk
createuser omnitalk_user

# Apply migrations
docker-compose exec api npm run migrate
```

### 3. WhatsApp Business Account

1. Apply for WhatsApp Business API
2. Get approved for business account
3. Configure phone number(s)
4. Generate access tokens

### 4. Test Integration

```bash
# Send test message
curl -X POST http://localhost:3001/api/messages \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "1234567890",
    "type": "text",
    "content": { "body": "Hello from OmniTalk!" }
  }'
```

## Deployment

### Production Deployment with Docker

```bash
# 1. Build images
docker-compose -f docker-compose.prod.yml build

# 2. Set production environment variables
export NODE_ENV=production
export JWT_SECRET=your_production_secret

# 3. Deploy to your server
docker-compose -f docker-compose.prod.yml up -d
```

### Kubernetes Deployment

```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: omnitalk
---
# k8s/postgres.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
spec:
  serviceName: postgres
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:15-alpine
        env:
        - name: POSTGRES_DB
          value: omnitalk
        - name: POSTGRES_USER
          value: omnitalk
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: password
```

### Environment Variables for Production

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Node environment | Yes |
| `DB_HOST` | PostgreSQL host | Yes |
| `DB_PORT` | PostgreSQL port | No |
| `DB_NAME` | Database name | Yes |
| `DB_USER` | Database user | Yes |
| `DB_PASSWORD` | Database password | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `META_ACCESS_TOKEN` | Meta API token | Yes |
| `META_PHONE_NUMBER_ID` | WhatsApp phone ID | Yes |
| `REDIS_HOST` | Redis host | Yes |
| `REDIS_PORT` | Redis port | No |

## Development Roadmap

### Phase 1 - Core Infrastructure ✅
- [x] Project setup with monorepo
- [x] Database schema and migrations
- [x] Authentication system
- [x] WhatsApp webhook handler
- [x] Basic bot CRUD operations

### Phase 2 - API & Basic Features ✅
- [x] Message routing and flow execution
- [x] AI agent integration framework
- [x] Conversation state management
- [x] E-commerce connectors (Shopify, WooCommerce, Magento)
- [x] CRM integrations (HubSpot, Salesforce, Zoho, Pipedrive)
- [x] Analytics API

### Phase 3 - AI Integration
- [ ] OpenAI GPT integration
- [ ] Anthropic Claude integration
- [ ] Google PaLM integration
- [ ] Prompt management system
- [ ] Context memory management

### Phase 4 - Dashboard
- [ ] React frontend
- [ ] Visual flow builder (React Flow)
- [ ] Bot management UI
- [ ] Analytics dashboard
- [ ] E-commerce integration UI

### Phase 5 - Multi-channel
- [ ] Facebook Messenger
- [ ] Instagram Direct
- [ ] RCS support
- [ ] Email integration
- [ ] SMS gateway

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

For issues and questions:
- Open an issue on GitHub
- Check [docs/](docs/) for detailed documentation

---
