-- Initial database schema for OmniTalk
-- Run this migration to set up the database

-- Users table
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  business_name VARCHAR(255) NOT NULL,
  api_key UUID UNIQUE DEFAULT uuid_generate_v4(),
  whatsapp_business_account_id VARCHAR(255),
  meta_business_account_id VARCHAR(255),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_api_key ON users(api_key);

-- Bots table
CREATE TABLE bots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  greeting_message TEXT,
  facebook_messenger_page_id VARCHAR(255),
  whatsapp_phone_number_id VARCHAR(255),
  settings JSONB DEFAULT '{}',
  ai_provider VARCHAR(50) DEFAULT 'openai',
  ai_model VARCHAR(100) DEFAULT 'gpt-4',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_bots_user_id ON bots(user_id);
CREATE INDEX idx_bots_name ON bots(name);

-- Flows table
CREATE TABLE flows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bot_id UUID REFERENCES bots(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  trigger_type VARCHAR(50) NOT NULL, -- 'message', 'keyword', 'event', 'schedule'
  trigger_data JSONB,
  nodes JSONB, -- Flow nodes (steps)
  edges JSONB, -- Connections between nodes
  conditions JSONB, -- Conditions for branching
  actions JSONB, -- Actions to execute
  is_active BOOLEAN DEFAULT true,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_flows_bot_id ON flows(bot_id);
CREATE INDEX idx_flows_trigger_type ON flows(trigger_type);
CREATE INDEX idx_flows_active ON flows(is_active);

-- Messages table
CREATE TYPE message_type AS ENUM ('text', 'image', 'video', 'audio', 'document', 'template', 'interactive');
CREATE TYPE message_status AS ENUM ('pending', 'sent', 'delivered', 'read', 'failed');

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bot_id UUID REFERENCES bots(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  from_number VARCHAR(50),
  to_number VARCHAR(50),
  type message_type,
  content JSONB,
  external_id VARCHAR(255), -- ID from WhatsApp API
  status message_status DEFAULT 'pending',
  reply_to VARCHAR(255),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_messages_bot_id ON messages(bot_id);
CREATE INDEX idx_messages_from ON messages(from_number);
CREATE INDEX idx_messages_to ON messages(to_number);
CREATE INDEX idx_messages_status ON messages(status);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_messages_external_id ON messages(external_id);

-- Conversation sessions table
CREATE TABLE conversation_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bot_id UUID REFERENCES bots(id) ON DELETE CASCADE,
  user_phone VARCHAR(50),
  flow_id UUID REFERENCES flows(id) ON DELETE SET NULL,
  current_node VARCHAR(255),
  context JSONB DEFAULT '{}',
  variables JSONB DEFAULT '{}',
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sessions_bot_user ON conversation_sessions(bot_id, user_phone);
CREATE INDEX idx_sessions_expires ON conversation_sessions(expires_at);

-- Orders table (for e-commerce integration)
CREATE TYPE order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bot_id UUID REFERENCES bots(id) ON DELETE CASCADE,
  user_phone VARCHAR(50),
  order_number VARCHAR(100),
  status order_status DEFAULT 'pending',
  items JSONB,
  total_amount DECIMAL(10, 2),
  currency VARCHAR(3) DEFAULT 'USD',
  shipping_address JSONB,
  tracking_number VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_orders_bot_status ON orders(bot_id, status);
CREATE INDEX idx_orders_user ON orders(user_phone);

-- Analytics table
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bot_id UUID REFERENCES bots(id) ON DELETE CASCADE,
  event_type VARCHAR(100),
  event_data JSONB,
  user_phone VARCHAR(50),
  session_id VARCHAR(255),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_analytics_bot_event ON analytics_events(bot_id, event_type);
CREATE INDEX idx_analytics_created_at ON analytics_events(created_at);

-- API Keys table for secure authentication
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  key_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  permissions JSONB DEFAULT '{}',
  last_used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  revoked BOOLEAN DEFAULT false
);

CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_key_hash ON api_keys(key_hash);

-- Insert default data
INSERT INTO users (email, password_hash, business_name, api_key)
VALUES ('admin@omnitalk.com', crypt('admin123', gen_salt('bf')), 'OmniTalk Admin', uuid_generate_v4());

-- Create indexes for better performance
CREATE INDEX CONCURRENTLY idx_messages_bot_created_at ON messages(bot_id, created_at DESC);
CREATE INDEX CONCURRENTLY idx_flows_bot_active ON flows(bot_id, is_active);