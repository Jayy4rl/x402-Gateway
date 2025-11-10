import React, { useState, useEffect } from 'react';
import { Code, ChevronDown, ChevronUp } from 'lucide-react';
import { apiService } from '../services/api.service';
import type { APIEndpoint } from '../types/marketplace.types';

interface APIEndpointsProps {
  apiId: string;
}

const APIEndpoints: React.FC<APIEndpointsProps> = ({ apiId }) => {
  const [endpoints, setEndpoints] = useState<APIEndpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedEndpoint, setExpandedEndpoint] = useState<string | null>(null);

  useEffect(() => {
    const fetchEndpoints = async () => {
      try {
        setLoading(true);
        const data = await apiService.getEndpoints(apiId);
        setEndpoints(data as APIEndpoint[]);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch endpoints');
      } finally {
        setLoading(false);
      }
    };

    fetchEndpoints();
  }, [apiId]);

  const getMethodColor = (method: string): string => {
    const colors: Record<string, string> = {
      GET: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      POST: 'bg-green-500/10 text-green-400 border-green-500/30',
      PUT: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
      PATCH: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
      DELETE: 'bg-red-500/10 text-red-400 border-red-500/30',
    };
    return colors[method.toUpperCase()] || 'bg-gray-500/10 text-gray-400 border-gray-500/30';
  };

  if (loading) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div className="flex items-center space-x-3">
          <Code className="w-5 h-5 text-gray-400 animate-pulse" />
          <p className="text-gray-400">Loading endpoints...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-900 rounded-lg p-6">
        <p className="text-red-300">{error}</p>
      </div>
    );
  }

  if (endpoints.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div className="flex items-center space-x-3">
          <Code className="w-5 h-5 text-gray-400" />
          <p className="text-gray-400">No endpoints found for this API</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg">
      <div className="border-b border-gray-800 px-6 py-4">
        <div className="flex items-center space-x-3">
          <Code className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold">API Endpoints ({endpoints.length})</h3>
        </div>
      </div>

      <div className="divide-y divide-gray-800">
        {endpoints.map((endpoint) => (
          <div key={endpoint.id} className="p-4">
            <div
              className="flex items-center justify-between cursor-pointer group"
              onClick={() => setExpandedEndpoint(expandedEndpoint === endpoint.id ? null : endpoint.id)}
            >
              <div className="flex items-center space-x-3 flex-1">
                <span
                  className={`px-2 py-1 text-xs font-mono font-bold rounded border ${getMethodColor(
                    endpoint.method
                  )}`}
                >
                  {endpoint.method.toUpperCase()}
                </span>
                <code className="text-sm font-mono text-gray-300 group-hover:text-white transition-colors">
                  {endpoint.path}
                </code>
              </div>
              {expandedEndpoint === endpoint.id ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </div>

            {endpoint.summary && (
              <p className="text-sm text-gray-400 mt-2 ml-16">{endpoint.summary}</p>
            )}

            {expandedEndpoint === endpoint.id && (
              <div className="mt-4 ml-16 space-y-3">
                {endpoint.description && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-400 uppercase mb-1">Description</h4>
                    <p className="text-sm text-gray-300">{endpoint.description}</p>
                  </div>
                )}

                {endpoint.parameters && Object.keys(endpoint.parameters).length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">Parameters</h4>
                    <div className="bg-black rounded border border-gray-800 p-3">
                      <pre className="text-xs text-gray-300 overflow-x-auto">
                        {JSON.stringify(endpoint.parameters, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {endpoint.request_body && Object.keys(endpoint.request_body).length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">Request Body</h4>
                    <div className="bg-black rounded border border-gray-800 p-3">
                      <pre className="text-xs text-gray-300 overflow-x-auto">
                        {JSON.stringify(endpoint.request_body, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {endpoint.responses && Object.keys(endpoint.responses).length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">Responses</h4>
                    <div className="bg-black rounded border border-gray-800 p-3">
                      <pre className="text-xs text-gray-300 overflow-x-auto">
                        {JSON.stringify(endpoint.responses, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default APIEndpoints;
