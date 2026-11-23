/**
 * Dashboard Page
 */

import React from 'react';
import { useAuth } from '../components/AuthProvider';

export function DashboardPage() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">
        Welcome, {user?.businessName || 'User'}!
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Active Bots"
          value="3"
          change="+2 from last month"
          icon={<Bot className="h-6 w-6 text-blue-600" />}
        />
        <StatCard
          title="Messages Received"
          value="1,248"
          change="+18% from last week"
          icon={<MessageSquare className="h-6 w-6 text-green-600" />}
        />
        <StatCard
          title="Conversion Rate"
          value="24.5%"
          change="+5.2% from last month"
          icon={<BarChart3 className="h-6 w-6 text-purple-600" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            <ActivityItem
              icon={<Bot className="h-5 w-5 text-blue-500" />}
              text="Bot 'SupportBot' received 23 messages"
              time="5 min ago"
            />
            <ActivityItem
              icon={<MessageSquare className="h-5 w-5 text-green-500" />}
              text="Flow 'Order Confirmation' executed 12 times"
              time="1 hour ago"
            />
            <ActivityItem
              icon={<BarChart3 className="h-5 w-5 text-purple-500" />}
              text="Analytics report generated"
              time="3 hours ago"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Bot className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <span className="text-sm">Create Bot</span>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
              <MessageSquare className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <span className="text-sm">New Flow</span>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Settings className="h-6 w-6 mx-auto mb-2 text-purple-600" />
              <span className="text-sm">Settings</span>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
              <BarChart3 className="h-6 w-6 mx-auto mb-2 text-orange-600" />
              <span className="text-sm">Analytics</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, change, icon }: {
  title: string;
  value: string | number;
  change: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className="p-3 bg-gray-100 rounded-full">
          {icon}
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-2">{change}</p>
    </div>
  );
}

function ActivityItem({ icon, text, time }: {
  icon: React.ReactNode;
  text: string;
  time: string;
}) {
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
      <div className="p-2 bg-white rounded-full">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-900">{text}</p>
        <p className="text-xs text-gray-500">{time}</p>
      </div>
    </div>
  );
}

import { Bot, MessageSquare, BarChart3 } from 'lucide-react';