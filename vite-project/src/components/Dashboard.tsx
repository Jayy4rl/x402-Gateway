import React, { useEffect, useState } from "react";
import {
  Search,
  Activity,
  TrendingUp,
  ChevronDown,
} from "lucide-react";
import { apiService } from "../services/api.service.ts";
import type { APIListing } from "../types/marketplace.types.ts";
import APICard from "./APICard.tsx";
import { API_CATEGORIES } from "../constants/categories.ts";

interface DashboardProps {
  onNavigate: (page: "dashboard" | "marketplace-listing" | "activity" | "new-project" | "project-overview" | "analytics" | "api-detail", apiId?: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [apis, setApis] = useState<APIListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.category-dropdown')) {
        setShowCategoryDropdown(false);
      }
    };

    if (showCategoryDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCategoryDropdown]);

  // Handle Add New button click
  const handleAddNew = () => {
    onNavigate("marketplace-listing");
  };

  // Filter APIs based on search query and category
  const filteredApis = apis.filter((api) => {
    const matchesSearch = 
      searchQuery === "" ||
      api.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      api.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = 
      selectedCategory === "All" || 
      api.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Main Content */}
      <main className="px-6 py-6 max-w-7xl mx-auto">
        {/* Search and Actions */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search Projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black border border-gray-800 rounded-md pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-gray-600 placeholder-gray-500"
            />
          </div>
          <div className="flex items-center space-x-3 ml-4">
            {/* Category Filter Dropdown */}
            <div className="relative category-dropdown">
              <button 
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className="px-4 py-2 border border-gray-800 rounded-md hover:bg-gray-900 transition-colors flex items-center space-x-2 text-sm"
              >
                <span className="text-gray-300">
                  {selectedCategory === "All" ? "All Categories" : selectedCategory}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
              
              {showCategoryDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-800 rounded-md shadow-lg z-10 max-h-64 overflow-y-auto">
                  <button
                    onClick={() => {
                      setSelectedCategory("All");
                      setShowCategoryDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-800 transition-colors ${
                      selectedCategory === "All" ? "text-white bg-gray-800" : "text-gray-400"
                    }`}
                  >
                    All Categories
                  </button>
                  {API_CATEGORIES.map((category) => (
                    <button
                      key={category}
                      onClick={() => {
                        setSelectedCategory(category);
                        setShowCategoryDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-800 transition-colors ${
                        selectedCategory === category ? "text-white bg-gray-800" : "text-gray-400"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <button 
              onClick={handleAddNew}
              className="px-4 py-2 bg-white text-black rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              Add New...
            </button>
          </div>
        </div>

        {/* Usage Section - Compact */}
        <div className="mb-6">
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-300">Usage</h2>
              <span className="text-xs text-gray-500">Last 30 days</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between py-2 px-3 bg-black/30 rounded-md border border-gray-800/50">
                <div className="flex items-center space-x-2">
                  <Activity className="w-3.5 h-3.5 text-gray-500" />
                  <span className="text-xs text-gray-400">Edge Requests</span>
                </div>
                <span className="text-xs font-medium text-white">4.2K / 1M</span>
              </div>
              <div className="flex items-center justify-between py-2 px-3 bg-black/30 rounded-md border border-gray-800/50">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-3.5 h-3.5 text-gray-500" />
                  <span className="text-xs text-gray-400">Revenue</span>
                </div>
                <span className="text-xs font-medium text-white">85.53 USD</span>
              </div>
            </div>
          </div>
        </div>

        {/* APIs List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-300">Projects</h2>
            {apis.length > 0 && (
              <span className="text-xs text-gray-500">
                Showing {filteredApis.length} of {apis.length} project{apis.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          
          {loading ? (
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-12 text-center">
              <div className="inline-block w-8 h-8 border-4 border-gray-600 border-t-white rounded-full animate-spin"></div>
              <p className="mt-4 text-sm text-gray-400">Loading APIs...</p>
            </div>
          ) : error ? (
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-8 text-center">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          ) : apis.length === 0 ? (
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-12 text-center">
              <h3 className="text-sm font-medium mb-2">No APIs yet</h3>
              <p className="text-xs text-gray-400 mb-4">
                Get started by adding your first API to the marketplace
              </p>
              <button 
                onClick={handleAddNew}
                className="px-4 py-2 bg-white text-black rounded-md text-sm font-medium hover:bg-gray-200"
              >
                Add Your First API
              </button>
            </div>
          ) : filteredApis.length === 0 ? (
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-12 text-center">
              <h3 className="text-sm font-medium mb-2">No matching projects</h3>
              <p className="text-xs text-gray-400 mb-4">
                Try adjusting your search or filter criteria
              </p>
              <button 
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                }}
                className="px-4 py-2 bg-gray-800 text-white rounded-md text-sm font-medium hover:bg-gray-700"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredApis.map((api) => (
                <APICard
                  key={api.id}
                  api={api}
                  onClick={() => onNavigate("api-detail", api.id)}
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
