# OmniTalk - WhatsApp Business Platform

A platform for building WhatsApp automations, AI agents, and campaigns - similar to [hello-charles.com](https://www.hello-charles.com/).

## Overview

OmniTalk provides a comprehensive solution for businesses to:
- Build interactive WhatsApp automations using a visual flow builder
- Deploy AI agents for customer service and sales
- Connect to e-commerce platforms (Shopify, WooCommerce, Magento)
- Integrate with CRM systems (HubSpot, Salesforce, Zoho)
- Track analytics and performance metrics

## Architecture

The platform follows a layered architecture pattern:

```
┌─────────────────────────────────────────────────────────────────────┐
│                        WEB DASHBOARD                               │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐      │
│  │ Flow Builder    │  │ Bot Manager     │  │ Analytics     │      │
│  │ Visual Editor   │  │ A/B Testing     │  │ Metrics       │      │
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
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    INTEGRATION LAYER                                 │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    DATA LAYER                                        │
└─────────────────────────────────────────────────────────────────────┘
```

## Features

### 1. Visual Flow Builder
- Drag-and-drop interface for creating WhatsApp automations
- Pre-built nodes for common workflows
- Real-time preview and testing

### 2. AI Agent Framework
- Support for multiple LLM providers (OpenAI, Anthropic Claude, Google PaLM)
- Prompt management system
- Conversation memory and state tracking

### 3. Multi-Channel Support
- WhatsApp Business API (primary)
- Facebook Messenger
- Instagram Direct
- RCS (Rich Communication Services)
- Email

### 4. E-commerce Integration
- Shopify
- WooCommerce
- Magento
- Inventory management
- Order processing

### 5. CRM Integration
- HubSpot
- Salesforce
- Zoho CRM
- Customer data synchronization

### 6. Analytics Dashboard
- Real-time metrics
- Conversion tracking
- Performance analytics
- Custom dashboards

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
│   │   ├── src/
│   │   │   ├── routes/         # API routes
│   │   │   ├── controllers/    # Business logic
│   │   │   ├── middleware/     # Auth & error handling
│   │   │   ├── services/       # External integrations
│   │   │   ├── config/         # Configuration
│   │   │   └── utils/          # Utilities
│   │   ├── migrations/         # Database migrations
│   │   └── Dockerfile
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

## Getting Started

### Prerequisites
- Node.js 18+ or Docker
- PostgreSQL 14+
- Redis 6+
- Meta WhatsApp Business API credentials

### Quick Start (Docker)

```bash
# Clone the repository
git clone https://github.com/ArunMandava3030/OmniTalk.git
cd OmniTalk

# Copy environment files
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# Update environment variables
# Edit .env files with your configuration

# Start all services
docker-compose up -d

# Apply database migrations
docker-compose exec api npm run migrate

# The API will be available at http://localhost:3001
# The dashboard will be available at http://localhost:3000
```

### Local Development

```bash
# Install dependencies
npm install

# Install app dependencies
npm install --workspaces

# Set up environment
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# Start services
npm run dev
```

## WhatsApp Integration Setup

### 1. Create Meta App
1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Create a new app
3. Add WhatsApp Business Platform product
4. Generate access token

### 2. Configure Webhook
1. Set webhook URL: `https://your-domain.com/webhook`
2. Set verify token (match with your `.env` file)
3. Subscribe to fields: `messages`, `message_templates`, `statuses`

### 3. Verify Phone Number
1. Submit your phone number for verification
2. Complete business verification

## API Documentation

The API documentation is available at:
- **Swagger/OpenAPI**: `http://localhost:3001/api/docs`
- **Health Check**: `http://localhost:3001/health`

### Authentication

All API routes (except `/webhook` and `/auth`) require JWT authentication:

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3001/api/bots
```

### Example: Register User

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123!",
    "businessName": "My Business"
  }'
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | API server port | No (default: 3001) |
| `DB_HOST` | PostgreSQL host | Yes |
| `DB_PORT` | PostgreSQL port | No (default: 5432) |
| `DB_NAME` | Database name | Yes |
| `DB_USER` | Database user | Yes |
| `DB_PASSWORD` | Database password | Yes |
| `REDIS_HOST` | Redis host | Yes |
| `REDIS_PORT` | Redis port | No (default: 6379) |
| `JWT_SECRET` | JWT signing secret | Yes |
| `META_ACCESS_TOKEN` | Meta API access token | Yes |
| `META_PHONE_NUMBER_ID` | WhatsApp phone number ID | Yes |
| `META_VERIFY_TOKEN` | Webhook verify token | Yes |
| `META_APP_SECRET` | Meta app secret | Yes |
| `FRONTEND_URL` | Frontend URL for CORS | No |

## Development Roadmap

### Phase 1 - Core Infrastructure (✓)
- [x] Project setup with monorepo
- [x] Database schema and migrations
- [x] Authentication system
- [x] WhatsApp webhook handler
- [x] Basic bot CRUD operations

### Phase 2 - API & Basic Features
- [ ] Message routing and flow execution
- [ ] AI agent integration
- [ ] Conversation state management
- [ ] Queue-based message processing

### Phase 3 - AI Integration
- [ ] OpenAI GPT integration
- [ ] Anthropic Claude integration
- [ ] Prompt management system
- [ ] Context memory management

### Phase 4 - Dashboard
- [ ] React frontend
- [ ] Visual flow builder
- [ ] Bot management UI
- [ ] Analytics dashboard

### Phase 5 - Integrations
- [ ] E-commerce connectors (Shopify, WooCommerce)
- [ ] CRM integrations (HubSpot, Salesforce)
- [ ] Analytics tracking
- [ ] Webhook system for external events

## License

MIT License

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Support

For issues and questions, please open an issue on GitHub.

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)