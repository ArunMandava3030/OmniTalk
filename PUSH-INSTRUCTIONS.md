# How to Push OmniTalk to GitHub

Since automatic git push was restricted, here are the manual steps to push the OmniTalk repository:

## Step 1: Verify Git Configuration
```bash
cd D:/Downloads/clips/OmniTalk
git config user.email "your-email@example.com"
git config user.name "Your Name"
```

## Step 2: Add Remote Repository (if not already added)
```bash
git remote add origin https://github.com/ArunMandava3030/OmniTalk.git
# OR if already exists:
git remote set-url origin https://github.com/ArunMandava3030/OmniTalk.git
```

## Step 3: Push to GitHub
```bash
git push -u origin main
```

## Alternative: Using GitHub CLI
```bash
cd D:/Downloads/clips/OmniTalk
gh repo view ArunMandava3030/OmniTalk --token YOUR_GITHUB_TOKEN || gh auth login
gh repo create ArunMandava3030/OmniTalk --public --source=. --remote=origin --push
```

## Files Created

### Core Files
- `README.md` - Project documentation
- `CLAUDE.md` - Architecture documentation
- `.gitignore` - Git ignore rules

### API Server (`apps/api/`)
- `src/index.ts` - Main entry point
- `src/routes/` - API route handlers:
  - `auth.ts` - User authentication
  - `bot.ts` - Bot management
  - `message.ts` - Message handling
  - `webhook.ts` - Meta WhatsApp webhook
- `src/services/` - Core services:
  - `database.ts` - PostgreSQL connection
  - `whatsappService.ts` - WhatsApp API client
  - `whatsappProcessor.ts` - Message processor
- `src/middleware/` - Express middleware
  - `auth.ts` - JWT authentication
  - `errorHandler.ts` - Error handling
- `src/config/` - Configuration management
- `migrations/` - Database schema
- `package.json` - Dependencies
- `Dockerfile` - Container definition
- `tsconfig.json` - TypeScript config

### Web Dashboard (`apps/web/`)
- `src/main.tsx` - React entry point
- `package.json` - Dependencies
- `index.html` - HTML template
- `tsconfig.json` - TypeScript config

### Infrastructure
- `docker-compose.yml` - Development environment
- `docker-compose.prod.yml` - Production environment
- `turbo.json` - Turborepo configuration
- `package.json` - Monorepo root

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Bots
- `GET /api/bots` - List bots
- `POST /api/bots` - Create bot
- `GET /api/bots/:id` - Get bot
- `PATCH /api/bots/:id` - Update bot
- `DELETE /api/bots/:id` - Delete bot

### Messages
- `GET /api/messages` - List messages
- `POST /api/messages` - Send message

### Webhook
- `GET /webhook` - Meta verification
- `POST /webhook` - Incoming messages

### Webhook Configuration
Create `/webhook` endpoint:
- URL: `https://your-domain.com/webhook`
- Verify Token: `omnitalk_webhook_token` (or set `META_VERIFY_TOKEN` env var)
- Subscription fields: `messages`, `message_templates`, `statuses`

## Environment Variables

Create `apps/api/.env` from `apps/api/.env.example`:

```bash
# Required
META_ACCESS_TOKEN=your_meta_access_token
META_PHONE_NUMBER_ID=your_phone_number_id
META_VERIFY_TOKEN=your_webhook_verify_token
META_APP_SECRET=your_meta_app_secret

# Optional
DB_HOST=localhost
DB_PORT=5432
DB_NAME=omnitalk
DB_USER=omnitalk
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
```

## Quick Start (Docker)

```bash
# 1. Copy environment file
cp apps/api/.env.example apps/api/.env

# 2. Edit apps/api/.env with your Meta credentials
# Get credentials from https://developers.facebook.com/

# 3. Start services
docker-compose up -d

# 4. Open in browser
# API: http://localhost:3001
# Dashboard: http://localhost:3000
# PostgreSQL: localhost:5432
# Redis: localhost:6379
# RabbitMQ: localhost:15672 (omnitalk/omnitalk_pass)
```

## Project Structure

```
OmniTalk/
├── apps/
│   ├── api/              # Main API server
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   ├── services/
│   │   │   ├── middleware/
│   │   │   ├── config/
│   │   ├── migrations/
│   ├── web/              # Dashboard frontend
│   └── worker/           # Background processor
├── docker-compose.yml
├── turbo.json
├── package.json
└── README.md
```