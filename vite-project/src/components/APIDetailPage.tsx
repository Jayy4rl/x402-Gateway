import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Activity, TrendingUp, DollarSign, ExternalLink, Code } from 'lucide-react';
import { apiService } from '../services/api.service.ts';
import APIEndpoints from './APIEndpoints.tsx';
import type { APIListing } from '../types/marketplace.types.ts';

const APIDetailPage: React.FC = () => {
  const { apiId } = useParams<{ apiId: string }>();
  const navigate = useNavigate();
  const [api, setApi] = useState<APIListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'endpoints'>('overview');

  useEffect(() => {
    const fetchAPIDetails = async () => {
      if (!apiId) return;
      
      try {
        setLoading(true);
        const data = await apiService.getListingById(apiId);
        setApi(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch API details');
      } finally {
        setLoading(false);
      }
    };

    if (apiId) {
      fetchAPIDetails();
    }
  }, [apiId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading API details...</p>
        </div>
      </div>
    );
  }

  if (error || !api) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2 text-gray-400 hover:text-white mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
          <div className="bg-red-900/20 border border-red-900 rounded-lg p-8 text-center">
            <p className="text-red-300">{error || 'API not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2 text-gray-400 hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-linear-to-br from-purple-500 to-pink-500 rounded flex items-center justify-center">
                <span className="text-white font-bold text-2xl">⚡</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-1">{api.name}</h1>
                <p className="text-gray-400">{api.description || 'No description'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 text-sm rounded ${
                api.status === 'active' 
                  ? 'bg-green-900/30 text-green-400 border border-green-900' 
                  : 'bg-gray-800 text-gray-400'
              }`}>
                {api.status}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <nav className="max-w-7xl mx-auto px-6 flex items-center space-x-6 text-sm">
          <button
            className={`py-3 ${
              activeTab === 'overview'
                ? 'border-b-2 border-purple-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`py-3 ${
              activeTab === 'endpoints'
                ? 'border-b-2 border-purple-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('endpoints')}
          >
            Endpoints
          </button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'overview' ? (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-2">
                  <Activity className="w-5 h-5 text-blue-400" />
                  <h3 className="text-sm font-medium text-gray-400">Total Calls</h3>
                </div>
                <p className="text-3xl font-bold">{api.totalCalls || 0}</p>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-2">
                  <DollarSign className="w-5 h-5 text-green-400" />
                  <h3 className="text-sm font-medium text-gray-400">Revenue</h3>
                </div>
                <p className="text-3xl font-bold">${api.revenue || '0'}</p>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-2">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                  <h3 className="text-sm font-medium text-gray-400">Price Per Call</h3>
                </div>
                <p className="text-3xl font-bold">{api.pricePerCall}</p>
              </div>
            </div>

            {/* API Information */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">API Information</h3>
              <dl className="space-y-3">
                <div className="flex items-start">
                  <dt className="w-32 text-sm text-gray-400">Base URL:</dt>
                  <dd className="flex-1">
                    <div className="flex items-center space-x-2">
                      <code className="text-sm bg-black px-3 py-1 rounded border border-gray-800">
                        {api.baseUrl}
                      </code>
                      <button
                        onClick={() => window.open(api.baseUrl, '_blank')}
                        className="p-1 hover:bg-gray-800 rounded"
                      >
                        <ExternalLink className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </dd>
                </div>

                <div className="flex items-start">
                  <dt className="w-32 text-sm text-gray-400">Category:</dt>
                  <dd className="flex-1 text-sm">{api.category || 'Uncategorized'}</dd>
                </div>

                <div className="flex items-start">
                  <dt className="w-32 text-sm text-gray-400">Source:</dt>
                  <dd className="flex-1 text-sm">
                    <span className="px-2 py-1 bg-gray-800 rounded text-xs">
                      {api.source === 'spec_upload' ? 'Uploaded Spec' : api.source === 'url_import' ? 'URL Import' : api.source}
                    </span>
                  </dd>
                </div>

                <div className="flex items-start">
                  <dt className="w-32 text-sm text-gray-400">Owner:</dt>
                  <dd className="flex-1">
                    <code className="text-sm text-purple-400">{api.owner}</code>
                  </dd>
                </div>

                <div className="flex items-start">
                  <dt className="w-32 text-sm text-gray-400">Created:</dt>
                  <dd className="flex-1 text-sm text-gray-400">
                    {new Date(api.createdAt).toLocaleString()}
                  </dd>
                </div>

                <div className="flex items-start">
                  <dt className="w-32 text-sm text-gray-400">Last Updated:</dt>
                  <dd className="flex-1 text-sm text-gray-400">
                    {new Date(api.updatedAt).toLocaleString()}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Preview Endpoints */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Code className="w-5 h-5 text-purple-400" />
                  <h3 className="text-lg font-semibold">Available Endpoints</h3>
                </div>
                <button
                  onClick={() => setActiveTab('endpoints')}
                  className="text-sm text-purple-400 hover:text-purple-300"
                >
                  View All →
                </button>
              </div>
              <p className="text-sm text-gray-400">
                Click "View All" to see the complete list of API endpoints with their parameters and schemas.
              </p>
            </div>
          </div>
        ) : (
          <APIEndpoints apiId={api.id} />
        )}
      </main>
    </div>
  );
};

export default APIDetailPage;
