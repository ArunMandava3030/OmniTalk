# OmniTalk Setup Guide

## End-to-End Setup Instructions

This guide will walk you through setting up your OmniTalk WhatsApp Business platform from scratch.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Step 1: Create Meta Developer Account](#step-1-create-meta-developer-account)
3. [Step 2: Set Up WhatsApp Business API](#step-2-set-up-whatsapp-business-api)
4. [Step 3: Configure Environment Variables](#step-3-configure-environment-variables)
5. [Step 4: Start the Platform](#step-4-start-the-platform)
6. [Step 5: Create Your First Bot](#step-5-create-your-first-bot)
7. [Step 6: Build a Flow](#step-6-build-a-flow)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have:

- ✅ A valid business email address
- ✅ A business website or app
- ✅ A verified business identity (for Meta approval)
- ✅ Node.js 18+ or Docker
- ✅ PostgreSQL 14+
- ✅ Redis 6+

---

## Step 1: Create Meta Developer Account

### 1.1 Create Facebook Developer Account

1. Go to [developers.facebook.com](https://developers.facebook.com/)
2. Click **Get Started**
3. Log in with your business email
4. Complete the developer verification

### 1.2 Create a New App

1. Click **My Apps** → **Create App**
2. Select **Business** as the app type
3. Enter your app name (e.g., "OmniTalk Production")
4. Enter your business email
5. Click **Create App**
6. Complete security check

### 1.3 Add WhatsApp Business Platform

1. In your app dashboard, click **Add Product**
2. Find **WhatsApp Business Platform**
3. Click **Set Up**
4. Accept the terms and conditions

---

## Step 2: Set Up WhatsApp Business API

### 2.1 Get Business Account ID

1. In the Meta Dashboard → **WhatsApp Business Platform**
2. Go to **Business Settings** → **Business Accounts**
3. Copy your **Business Account ID**

### 2.2 Add Phone Number

1. In WhatsApp Business Platform → **Phone Numbers**
2. Click **Add Phone Number**
3. Enter your business phone number
4. Complete the verification process
5. Note the **Phone Number ID**

### 2.3 Generate Access Token

1. In WhatsApp Business Platform → **Settings**
2. Go to **System User** → **Access Tokens**
3. Generate a new **Permanent Access Token**
4. Copy and save the token securely

---

## Step 3: Configure Environment Variables

### 3.1 Copy Environment Template

```bash
cd OmniTalk
cp apps/api/.env.example apps/api/.env
```

### 3.2 Configure Required Variables

Edit `apps/api/.env` with your credentials:

```env
# Server Configuration
NODE_ENV=production
PORT=3001

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=omnitalk
DB_USER=omnitalk_user
DB_PASSWORD=secure_password_here

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_minimum_32_characters

# Meta WhatsApp Business API
META_ACCESS_TOKEN=your_meta_access_token_here
META_PHONE_NUMBER_ID=your_phone_number_id_here
META_VERIFY_TOKEN=your_webhook_verify_token_here  # Choose any string
META_APP_SECRET=your_meta_app_secret_here

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

### 3.3 Create Strong Secrets

```bash
# Generate secure JWT secret
openssl rand -base64 32

# Generate secure database password
openssl rand -base64 24
```

---

## Step 4: Start the Platform

### Option A: Docker Deployment (Recommended)

```bash
# Start all services
docker-compose up -d

# Wait for services to be ready (10-15 seconds)
sleep 15

# Apply database migrations
docker-compose exec api npm run migrate

# Check if services are running
docker-compose ps
```

### Option B: Local Development

```bash
# Terminal 1: Start PostgreSQL
docker run -d \
  --name omnitalk-postgres \
  -e POSTGRES_DB=omnitalk \
  -e POSTGRES_USER=omnitalk_user \
  -e POSTGRES_PASSWORD=secure_password \
  -p 5432:5432 \
  postgres:15-alpine

# Terminal 2: Start Redis
docker run -d \
  --name omnitalk-redis \
  -p 6379:6379 \
  redis:7-alpine

# Terminal 3: Start API server
npm run dev:api

# Terminal 4: Start Web Dashboard
npm run dev:web

# Terminal 5: Start Worker
npm run dev:worker
```

### 4.1 Verify Services

Check that all services are running:

```bash
# API Health Check
curl http://localhost:3001/health

# Expected Response:
# {"status":"healthy","timestamp":"2024-01-01T00:00:00.000Z"}
```

---

## Step 5: Create Your First Bot

### 5.1 Register Your Account

Open your browser and go to `http://localhost:3001/api/auth/register`:

```json
POST http://localhost:3001/api/auth/register
Content-Type: application/json

{
  "email": "admin@yourbusiness.com",
  "password": "YourSecurePassword123!",
  "businessName": "Your Business Name"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "email": "admin@yourbusiness.com",
    "businessName": "Your Business Name"
  }
}
```

Save the `token` for future authentication!

### 5.2 Create a Bot

```bash
TOKEN="your_token_from_step_5_1"

curl -X POST http://localhost:3001/api/bots \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Customer Support Bot",
    "description": "Handles customer inquiries and support",
    "greetingMessage": "Hello! 👋 Welcome to Our Business. How can I help you today?"
  }'
```

**Response:**
```json
{
  "id": "bot-uuid-here",
  "userId": "user-uuid-here",
  "name": "Customer Support Bot",
  "description": "Handles customer inquiries and support",
  "greetingMessage": "Hello! 👋 Welcome to Our Business...",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

Save the `id` as `BOT_ID`!

---

## Step 6: Build a Flow

### 6.1 Create a Welcome Flow

```bash
curl -X POST http://localhost:3001/api/flows \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "botId": "your_bot_id_here",
    "name": "Welcome Flow",
    "description": "Greets new users and collects initial info",
    "triggerType": "message",
    "triggerData": {
      "keywords": ["hello", "hi", "start", "help"]
    },
    "nodes": {
      "start": {
        "id": "start",
        "type": "trigger",
        "next": "greeting"
      },
      "greeting": {
        "id": "greeting",
        "type": "message",
        "text": "👋 Hello! What can I help you with today?",
        "options": [
          {"text": "Product Info", "next": "products"},
          {"text": "Order Status", "next": "order"},
          {"text": "Contact Support", "next": "support"}
        ]
      }
    }
  }'
```

### 6.2 Configure Webhook with Meta

1. Go to [Meta Developers Console](https://developers.facebook.com/)
2. Select your app → **Products** → **WhatsApp Business Platform**
3. Click **Webhooks** → **Edit Settings**
4. Enter your webhook URL:
   ```
   https://your-domain.com/webhook
   ```
   Or for local testing with ngrok:
   ```
   https://your-ngrok-subdomain.ngrok.io/webhook
   ```

5. Enter the verify token from your `.env` file
6. Subscribe to fields: `messages`, `message_templates`, `statuses`

### 6.3 Test Webhook

```bash
# Test webhook verification (simulate Meta)
curl -X GET "http://localhost:3001/webhook?hub.mode=subscribe&hub.verify_token=your_verify_token&hub.challenge=test_challenge"
```

---

## E-commerce Integration (Optional)

### Shopify Integration

```bash
# 1. Create private app in Shopify Admin
# 2. Get Admin API access token

# Add store connector
curl -X POST http://localhost:3001/api/ecommerce/stores \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "shopify",
    "storeUrl": "https://your-store.myshopify.com",
    "accessToken": "shpat_your_token_here"
  }'
```

### WooCommerce Integration

```bash
curl -X POST http://localhost:3001/api/ecommerce/stores \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "woocommerce",
    "apiUrl": "https://your-store.com/wp-json/wc/v3",
    "apiKey": "ck_your_consumer_key",
    "accessToken": "ck_your_consumer_secret"
  }'
```

---

## CRM Integration (Optional)

### HubSpot Integration

```bash
curl -X POST http://localhost:3001/api/crm/integrations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "hubspot",
    "apiKey": "your_hubspot_private_app_key"
  }'
```

---

## Troubleshooting

### Common Issues

#### ❌ Database Connection Failed

```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Check connection
psql -h localhost -U omnitalk_user -d omnitalk

# Reset database
docker-compose down -v
docker-compose up -d
```

#### ❌ WebSocket Connection Refused

```bash
# Check if port 3001 is in use
lsof -i :3001

# Kill process and restart
docker-compose restart api
```

#### ❌ WhatsApp Webhook Not Working

1. Check webhook URL is accessible publicly
2. Verify token matches `.env` file
3. Check Meta app permissions
4. Look at logs: `docker-compose logs api`

#### ❌ Authentication Errors

```bash
# Clear saved token
rm ~/.omnitalk/token

# Regenerate token
# Login again and save the new token
```

### Check Logs

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs api
docker-compose logs postgres
docker-compose logs redis
```

### Port Conflicts

```bash
# Change ports in docker-compose.yml
services:
  api:
    ports:
      - "3002:3001"  # Change host port
```

---

## Next Steps

1. **Add your WhatsApp number** in the dashboard
2. **Configure flow triggers** based on keywords
3. **Connect e-commerce platform** for order updates
4. **Set up CRM sync** for customer data
5. **Configure AI agents** for intelligent responses

---

## Getting Help

- **Documentation**: `/docs` directory
- **Examples**: `/examples` directory
- **Issues**: Open a GitHub issue
- **Community**: Join our Discord server (if available)

---

🎉 **Congratulations!** Your OmniTalk platform is now set up and running. Start building your WhatsApp automations!