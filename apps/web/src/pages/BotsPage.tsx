/**
 * Bots Page
 * List and manage WhatsApp bots
 */

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bot, Plus, Edit, Trash, MessageSquare, Settings, Activity } from 'lucide-react';
import { useAuth } from '../components/AuthProvider';

interface Bot {
  id: string;
  name: string;
  description?: string;
  greetingMessage?: string;
  whatsappPhoneNumberId?: string;
  settings: Record<string, any>;
  createdAt: string;
  messageCount?: number;
}

export function BotsPage() {
  const [bots, setBots] = useState<Bot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchBots();
  }, []);

  const fetchBots = async () => {
    try {
      const response = await axios.get('/api/bots');
      setBots(response.data);
    } catch (error) {
      console.error('Failed to fetch bots:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBot = async (botData: Partial<Bot>) => {
    try {
      await axios.post('/api/bots', botData);
      setShowCreateModal(false);
      fetchBots();
    } catch (error) {
      console.error('Failed to create bot:', error);
    }
  };

  const handleDeleteBot = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this bot?')) {
      try {
        await axios.delete(`/api/bots/${id}`);
        fetchBots();
      } catch (error) {
        console.error('Failed to delete bot:', error);
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Bots</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-5 w-5" />
          Create Bot
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bots.map(bot => (
            <BotCard
              key={bot.id}
              bot={bot}
              onEdit={() => console.log('Edit bot', bot.id)}
              onDelete={() => handleDeleteBot(bot.id)}
            />
          ))}
        </div>
      )}

      {bots.length === 0 && !loading && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No bots yet</h3>
          <p className="text-gray-600 mb-4">Create your first WhatsApp bot to get started</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create Bot
          </button>
        </div>
      )}

      {showCreateModal && (
        <CreateBotModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateBot}
        />
      )}
    </div>
  );
}

function BotCard({ bot, onEdit, onDelete }: {
  bot: Bot;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-blue-100 rounded-full">
          <Bot className="h-6 w-6 text-blue-600" />
        </div>
        <div className="flex gap-2">
          <button onClick={onEdit} className="p-1 text-gray-400 hover:text-gray-600">
            <Edit className="h-5 w-5" />
          </button>
          <button onClick={onDelete} className="p-1 text-gray-400 hover:text-red-600">
            <Trash className="h-5 w-5" />
          </button>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-1">{bot.name}</h3>
      {bot.description && (
        <p className="text-sm text-gray-600 mb-3">{bot.description}</p>
      )}

      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
        <div className="flex items-center gap-1">
          <MessageSquare className="h-4 w-4" />
          <span>{bot.messageCount || 0} messages</span>
        </div>
        {bot.whatsappPhoneNumberId && (
          <div className="flex items-center gap-1">
            <Activity className="h-4 w-4" />
            <span>WhatsApp connected</span>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50">
          <Settings className="h-4 w-4 inline mr-1" />
          Settings
        </button>
        <button className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50">
          <MessageSquare className="h-4 w-4 inline mr-1" />
          Messages
        </button>
      </div>
    </div>
  );
}

function CreateBotModal({ onClose, onSubmit }: {
  onClose: () => void;
  onSubmit: (bot: Partial<Bot>) => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [greetingMessage, setGreetingMessage] = useState('Hello! How can I help you today?');

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSubmit({ name, description, greetingMessage });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Bot</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bot Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="My WhatsApp Bot"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows={2}
              placeholder="What is this bot for?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Greeting Message</label>
            <textarea
              value={greetingMessage}
              onChange={e => setGreetingMessage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows={2}
            />
          </div>
        </div>

        <div className="flex gap-3 justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create Bot
          </button>
        </div>
      </div>
    </div>
  );
}