import React, { useState } from 'react';
import { User, Palette, Database, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { getUserPreferences, saveUserPreferences, clearAllStorage } from '../utils/storage.ts';
import type { UserPreferences } from '../utils/storage.ts';

interface SettingsPageProps {
  onNavigate: (page: string) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ onNavigate }) => {
  const { walletAddress, logout } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences>(getUserPreferences());
  const [saved, setSaved] = useState(false);

  const handleSavePreferences = () => {
    saveUserPreferences(preferences);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  const handleClearData = () => {
    if (window.confirm('This will clear all your local data including preferences and drafts. Continue?')) {
      clearAllStorage();
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold mb-2">Settings</h1>
          <p className="text-sm text-gray-400">Manage your account and preferences</p>
        </div>

        {/* Account Section */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 mb-6">
          <div className="flex items-center space-x-3 mb-6">
            <User className="w-5 h-5 text-gray-500" />
            <h2 className="text-sm font-semibold text-gray-300">Account</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">
                Wallet Address
              </label>
              <div className="bg-black/30 border border-gray-800/50 rounded-md px-4 py-3">
                <code className="text-xs text-gray-300 break-all">
                  {walletAddress || 'Not connected'}
                </code>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-gray-800">
              <div>
                <h3 className="text-sm font-medium">Logout</h3>
                <p className="text-xs text-gray-400">Disconnect your wallet and logout</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-white text-sm font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 mb-6">
          <div className="flex items-center space-x-3 mb-6">
            <Palette className="w-5 h-5 text-gray-500" />
            <h2 className="text-sm font-semibold text-gray-300">Preferences</h2>
          </div>

          <div className="space-y-4">
            {/* Theme (currently only dark) */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">
                Theme
              </label>
              <select
                value={preferences.theme || 'dark'}
                onChange={(e) => setPreferences({ ...preferences, theme: e.target.value as 'dark' | 'light' })}
                className="w-full bg-black border border-gray-800 rounded-md px-4 py-2 text-sm text-white focus:outline-none focus:border-gray-600 transition-colors cursor-pointer"
              >
                <option value="dark">Dark</option>
                <option value="light" disabled>Light (Coming Soon)</option>
              </select>
            </div>

            {/* Default View */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">
                Default API View
              </label>
              <select
                value={preferences.defaultView || 'grid'}
                onChange={(e) => setPreferences({ ...preferences, defaultView: e.target.value as 'grid' | 'list' })}
                className="w-full bg-black border border-gray-800 rounded-md px-4 py-2 text-sm text-white focus:outline-none focus:border-gray-600 transition-colors cursor-pointer"
              >
                <option value="grid">Grid</option>
                <option value="list">List</option>
              </select>
            </div>

            {/* Notifications */}
            <div className="flex items-center justify-between py-2 px-3 bg-black/30 rounded-md border border-gray-800/50">
              <div>
                <h3 className="text-sm font-medium">Notifications</h3>
                <p className="text-xs text-gray-400">Receive notifications about API activity</p>
              </div>
              <button
                onClick={() => setPreferences({ ...preferences, notifications: !preferences.notifications })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.notifications ? 'bg-white' : 'bg-gray-700'
                }`}
                aria-label="Toggle notifications"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full transition-transform ${
                    preferences.notifications ? 'translate-x-6 bg-black' : 'translate-x-1 bg-white'
                  }`}
                />
              </button>
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t border-gray-800">
              <button
                onClick={handleSavePreferences}
                className={`w-full px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  saved 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-white text-black hover:bg-gray-200'
                }`}
              >
                {saved ? '✓ Saved!' : 'Save Preferences'}
              </button>
            </div>
          </div>
        </div>

        {/* Data & Privacy */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 mb-6">
          <div className="flex items-center space-x-3 mb-6">
            <Database className="w-5 h-5 text-gray-500" />
            <h2 className="text-sm font-semibold text-gray-300">Data & Privacy</h2>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-2 px-3 bg-black/30 rounded-md border border-gray-800/50">
              <div>
                <h3 className="text-sm font-medium">Clear Local Data</h3>
                <p className="text-xs text-gray-400">Remove all locally stored data including drafts and preferences</p>
              </div>
              <button
                onClick={handleClearData}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-md text-white text-sm font-medium transition-colors"
              >
                Clear Data
              </button>
            </div>
          </div>
        </div>

        {/* Back to Dashboard */}
        <button
          onClick={() => onNavigate('dashboard')}
          className="w-full px-4 py-2 bg-black border border-gray-800 rounded-md hover:bg-gray-900 text-white text-sm font-medium transition-colors"
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
