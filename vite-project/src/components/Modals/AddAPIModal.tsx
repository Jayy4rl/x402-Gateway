import React, { useState } from 'react';
import { X, DollarSign, Link2, FileText, Key, Tag, ChevronDown } from 'lucide-react';
import type { AddAPIFormData } from '../../types/marketplace.types.ts';
import { API_CATEGORIES } from '../../constants/categories.ts';

interface AddAPIModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AddAPIFormData) => Promise<void>;
}

const AddAPIModal: React.FC<AddAPIModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<AddAPIFormData>({
    name: '',
    description: '',
    baseUrl: '',
    apiKey: '',
    pricePerCall: '',
    category: '',
    walletAddress: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('API name is required');
      return false;
    }
    if (!formData.baseUrl.trim()) {
      setError('Base URL is required');
      return false;
    }
    if (!formData.pricePerCall.trim()) {
      setError('Price per call is required');
      return false;
    }
    if (!formData.category || formData.category.trim() === '') {
      setError('Category is required');
      return false;
    }
    // price must be a positive number (we allow values like 0.001 or integer sats)
    const priceNum = parseFloat(formData.pricePerCall.replace(/[^0-9.]/g, ''));
    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Price per call must be a number greater than 0');
      return false;
    }
    if (!formData.walletAddress || !formData.walletAddress.trim()) {
      setError('Wallet address is required');
      return false;
    }

    // Validate URL format
    try {
      new URL(formData.baseUrl);
    } catch {
      setError('Please enter a valid URL');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onSubmit(formData);
      // Reset form
      setFormData({
        name: '',
        description: '',
        baseUrl: '',
        apiKey: '',
  pricePerCall: '',
  category: '',
  walletAddress: ''
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add API');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-2xl font-bold text-white">Add API Manually</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            disabled={loading}
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-900/20 border border-red-900 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* API Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
              API Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Weather Forecast API"
                className="w-full bg-black border border-gray-800 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                required
              />
            </div>
          </div>

          {/* Base URL */}
          <div>
            <label htmlFor="baseUrl" className="block text-sm font-medium text-gray-300 mb-2">
              Base URL <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Link2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="url"
                id="baseUrl"
                name="baseUrl"
                value={formData.baseUrl}
                onChange={handleChange}
                placeholder="https://api.example.com/v1"
                className="w-full bg-black border border-gray-800 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                required
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              The base URL where your API is hosted
            </p>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe what your API does..."
              rows={4}
              className="w-full bg-black border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors resize-none"
            />
          </div>

          {/* API Key */}
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-300 mb-2">
              API Key (Optional)
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="password"
                id="apiKey"
                name="apiKey"
                value={formData.apiKey}
                onChange={handleChange}
                placeholder="sk_••••••••••••••••"
                className="w-full bg-black border border-gray-800 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              If your API requires authentication
            </p>
          </div>

          {/* Wallet Address */}
          <div>
            <label htmlFor="walletAddress" className="block text-sm font-medium text-gray-300 mb-2">
              Wallet Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                id="walletAddress"
                name="walletAddress"
                value={(formData as unknown as { walletAddress?: string }).walletAddress || ''}
                onChange={handleChange}
                placeholder="0x... or wallet public address"
                className="w-full bg-black border border-gray-800 rounded-lg pl-4 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              The wallet address to receive payments (required)
            </p>
          </div>

          {/* Price Per Call */}
          <div>
            <label htmlFor="pricePerCall" className="block text-sm font-medium text-gray-300 mb-2">
              Price Per Call <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                id="pricePerCall"
                name="pricePerCall"
                value={formData.pricePerCall}
                onChange={handleChange}
                placeholder="$0.001"
                className="w-full bg-black border border-gray-800 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                required
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Cost per API call (e.g., $0.001, 100 sats, or free)
            </p>
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none z-10" />
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none z-10" />
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full bg-black border border-gray-800 rounded-lg pl-10 pr-10 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors appearance-none cursor-pointer hover:border-gray-700"
                required
              >
                <option value="" className="bg-gray-900">Select a category...</option>
                {API_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="bg-gray-900">
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Choose the most relevant category for your API
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Adding...</span>
                </>
              ) : (
                <span>Add API to Marketplace</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAPIModal;
