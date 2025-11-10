import React, { useEffect, useState } from "react";
import {
  Search,
  Grid,
  List,
  Activity,
  TrendingUp,
} from "lucide-react";
import { apiService } from "../services/api.service.ts";
import type { APIListing } from "../types/marketplace.types.ts";
import APICard from "./APICard.tsx";

interface DashboardProps {
  onNavigate: (page: "dashboard" | "marketplace-listing" | "activity" | "new-project" | "project-overview" | "analytics") => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [apis, setApis] = useState<APIListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch APIs function
  const fetchApis = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getAllListings();
      setApis(data);
    } catch (err) {
      console.error("Error fetching APIs:", err);
      setError("Failed to load APIs");
    } finally {
      setLoading(false);
    }
  };

  // Fetch APIs on component mount (only once)
  useEffect(() => {
    fetchApis();
  }, []);

  // Handle Add New button click
  const handleAddNew = () => {
    onNavigate("marketplace-listing");
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Main Content */}
      <main className="px-6 py-8 max-w-7xl mx-auto">
        {/* Search and Actions */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex-1 max-w-2xl relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search APIs..."
              className="w-full bg-black border border-gray-800 rounded pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-gray-600"
            />
          </div>
          <div className="flex items-center space-x-2 ml-4">
            <button className="p-2 border border-gray-800 rounded hover:bg-gray-900">
              <List className="w-4 h-4" />
            </button>
            <button className="p-2 border border-gray-800 rounded hover:bg-gray-900">
              <Grid className="w-4 h-4" />
            </button>
            <button 
              onClick={handleAddNew}
              className="px-4 py-2 bg-white text-black rounded text-sm font-medium hover:bg-gray-200"
            >
              Add New...
            </button>
          </div>
        </div>

        {/* Usage Section */}
        <div className="mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Usage</h2>
              <button className="px-3 py-1.5 text-sm border border-gray-700 rounded hover:bg-gray-800">
                Upgrade
              </button>
            </div>
            <div className="text-sm text-gray-400 mb-2">Last 30 days</div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">API Requests</span>
                </div>
                <span className="text-sm">4K / 1M</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">Revenue</span>
                </div>
                <span className="text-sm">82.46 sats / 100K sats</span>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts Section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Alerts</h2>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center">
            <h3 className="font-medium mb-2">Get alerted for anomalies</h3>
            <p className="text-sm text-gray-400 mb-4">
              Automatically monitor your APIs for anomalies and get notified.
            </p>
            <button className="px-4 py-2 bg-white text-black rounded text-sm font-medium hover:bg-gray-200">
              Upgrade to Observability Plus
            </button>
          </div>
        </div>

        {/* APIs List */}
        <div>
          <h2 className="text-lg font-semibold mb-4">APIs</h2>
          
          {loading ? (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
              <div className="inline-block w-8 h-8 border-4 border-gray-600 border-t-white rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-400">Loading APIs...</p>
            </div>
          ) : error ? (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center">
              <p className="text-red-400">{error}</p>
            </div>
          ) : apis.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
              <h3 className="font-medium mb-2">No APIs yet</h3>
              <p className="text-sm text-gray-400 mb-4">
                Get started by adding your first API to the marketplace
              </p>
              <button 
                onClick={handleAddNew}
                className="px-4 py-2 bg-white text-black rounded text-sm font-medium hover:bg-gray-200"
              >
                Add Your First API
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {apis.map((api) => (
                <APICard
                  key={api.id}
                  api={api}
                  onClick={() => {
                    // TODO: Navigate to API detail page
                    console.log('Navigate to API:', api.id);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
