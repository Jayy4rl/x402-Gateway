import React, { useState, useEffect } from 'react';
import { Plus, Check, AlertCircle, Link2, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AddAPIModal from './Modals/AddAPIModal';
import UploadSpecModal from './Modals/UploadSpecModal';
import PasteUrlModal from './Modals/PasteUrlModal';
import { apiService } from '../services/api.service';
import type { APIListing, AddAPIFormData } from '../types/marketplace.types';

interface MarketplaceListingPageProps {
  // Accept either a state setter (used in several callers) or a simple navigation callback
  onNavigate?: React.Dispatch<React.SetStateAction<unknown>> | ((page: string) => void);
}

const MarketplaceListingPage: React.FC<MarketplaceListingPageProps> = ({ onNavigate }) => {
  const { walletAddress } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isPasteUrlModalOpen, setIsPasteUrlModalOpen] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [apiListings, setApiListings] = useState<APIListing[]>([]);

  // Fetch API listings
  useEffect(() => {
    fetchApiListings();
  }, []);

  const fetchApiListings = async () => {
    try {
      const listings = await apiService.getAllListings();
      setApiListings(listings);
    } catch (err) {
      console.error('Error fetching API listings:', err);
    }
  };

  const handleManualAdd = () => {
    setIsModalOpen(true);
  };

  const handleOpenUpload = () => setIsUploadModalOpen(true);
  const handleOpenPasteUrl = () => setIsPasteUrlModalOpen(true);

  const handleManualSubmit = async (formData: AddAPIFormData) => {
    // construct gateway URL
    const slugBase = formData.name.split(/\s+/).slice(0,2).join('-').toLowerCase() || 'api';
  const slug = slugBase.replace(/[^a-z0-9-]/g, '');
    const gatewayUrl = `https://x402-gateway.vercel.app/${slug}`;

    const listing = await apiService.createListing({
      ...formData,
      originalBaseUrl: formData.baseUrl,
      baseUrl: gatewayUrl,
      owner: formData.walletAddress || walletAddress || '',
      source: 'manual',
    });

    setSuccess(`API "${listing.name}" added successfully!`);
    await fetchApiListings();
    
    setTimeout(() => {
      setSuccess(null);
      if (onNavigate) {
        onNavigate('dashboard');
      }
    }, 2000);
  };


  const handleUploadSpec = async (file: File, walletAddress: string, pricePerCall: string) => {
    if (!walletAddress) throw new Error('Please connect your wallet first');
    
    try {
      // Read file content
      const content = await file.text();
      
      // Determine file type
      const ext = file.name.split('.').pop()?.toLowerCase();
      const fileType = (ext === 'yml' || ext === 'yaml') ? 'yaml' : 'json';
      
      // Upload spec to backend
      const result = await apiService.uploadSpec(content, fileType, walletAddress, pricePerCall);
      
      setSuccess(`API "${result.listing.name}" created with ${result.endpointsCount} endpoints!`);
      await fetchApiListings();
      
      setTimeout(() => {
        setSuccess(null);
        if (onNavigate) {
          onNavigate('dashboard');
        }
      }, 2000);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to upload spec');
    }
  };

  const handlePasteUrl = async (url: string, walletAddress: string, pricePerCall: string) => {
    if (!walletAddress) throw new Error('Please connect your wallet first');
    
    try {
      // Parse URL with backend
      const result = await apiService.parseDocumentationUrl(url, walletAddress, pricePerCall);
      
      setSuccess(`API "${result.listing.name}" imported with ${result.endpointsCount} endpoints!`);
      await fetchApiListings();
      
      setTimeout(() => {
        setSuccess(null);
        if (onNavigate) {
          onNavigate('dashboard');
        }
      }, 2000);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to import from URL');
    }
  };

  // GitHub import removed — no repository list to filter

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <div
              className="w-8 h-8 bg-white flex items-center justify-center cursor-pointer"
              onClick={() => onNavigate && onNavigate('dashboard')}
            >
              <span className="text-black font-bold">▲</span>
            </div>
            <h1 className="text-xl font-semibold">List Your API</h1>
          </div>
          <button
            onClick={() => onNavigate && onNavigate('dashboard')}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            ← Back to Dashboard
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-12 max-w-7xl mx-auto">
        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-900/20 border border-green-900 rounded-lg flex items-center space-x-3">
            <Check className="w-5 h-5 text-green-400 shrink-0" />
            <p className="text-green-300">{success}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-900 rounded-lg flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-300">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-sm text-red-400 hover:text-red-300 mt-1"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

  {/* Options View */}
  <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">List Your API on the Marketplace</h2>
              <p className="text-gray-400 text-lg">
                Choose how you'd like to add your API to the marketplace
              </p>
            </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Upload Spec */}
                  <div
                    onClick={handleOpenUpload}
                    className="bg-gray-900 border border-gray-800 rounded-lg p-8 hover:border-purple-600 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center justify-center w-16 h-16 bg-gray-800 rounded-lg mb-6 group-hover:bg-purple-900/30 transition-colors">
                      <FileText className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3">Upload API Spec</h3>
                    <p className="text-gray-400 mb-6">
                      Upload an OpenAPI/Swagger, Postman export, or other spec (.json, .yml, .yaml)
                    </p>
                    <ul className="space-y-2 text-sm text-gray-500">
                      <li className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span>Support .json, .yml, .yaml</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span>Drag & drop or browse files</span>
                      </li>
                    </ul>
                  </div>

                  {/* Paste URL */}
                  <div
                    onClick={handleOpenPasteUrl}
                    className="bg-gray-900 border border-gray-800 rounded-lg p-8 hover:border-purple-600 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center justify-center w-16 h-16 bg-gray-800 rounded-lg mb-6 group-hover:bg-purple-900/30 transition-colors">
                      <Link2 className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3">Paste Documentation URL</h3>
                    <p className="text-gray-400 mb-6">
                      Paste a URL to your API docs (hosted OpenAPI, Swagger UI, Postman link) to parse
                    </p>
                    <ul className="space-y-2 text-sm text-gray-500">
                      <li className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span>Supports hosted specs and doc pages</span>
                      </li>
                    </ul>
                  </div>

                  {/* Manual Entry */}
                  <div
                    onClick={handleManualAdd}
                    className="bg-gray-900 border border-gray-800 rounded-lg p-8 hover:border-purple-600 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center justify-center w-16 h-16 bg-gray-800 rounded-lg mb-6 group-hover:bg-purple-900/30 transition-colors">
                      <Plus className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3">Add Manually</h3>
                    <p className="text-gray-400 mb-6">
                      Fill out a form with your API details and list it on the marketplace
                    </p>
                    <ul className="space-y-2 text-sm text-gray-500">
                      <li className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span>Full control over details</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span>Set custom pricing</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span>No GitHub required</span>
                      </li>
                    </ul>
                  </div>
                </div>
          </div>

  {/* GitHub import option removed — replaced with Upload and Paste URL options per spec */}

        {/* Recently Added APIs */}
        {apiListings.length > 0 && (
          <div className="mt-16">
            <h3 className="text-2xl font-bold mb-6">Recently Added to Marketplace</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {apiListings.slice(0, 3).map((api) => (
                <div
                  key={api.id}
                  className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-linear-to-br from-purple-500 to-pink-500 rounded flex items-center justify-center">
                      <span className="text-white font-bold">⚡</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{api.name}</h4>
                      <p className="text-xs text-gray-500">{api.category}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                    {api.description || 'No description'}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-purple-400 font-medium">{api.pricePerCall}</span>
                    <span className="text-gray-500">per call</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Add API Modals */}
      <AddAPIModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleManualSubmit}
      />
      <UploadSpecModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUploadSpec}
      />
      <PasteUrlModal
        isOpen={isPasteUrlModalOpen}
        onClose={() => setIsPasteUrlModalOpen(false)}
        onSubmit={handlePasteUrl}
      />
    </div>
  );
};

export default MarketplaceListingPage;
