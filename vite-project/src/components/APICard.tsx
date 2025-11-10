import React from 'react';
import type { APIListing } from '../types/marketplace.types.ts';
import { getCategoryIcon, getCategoryColor } from '../utils/categoryHelpers.ts';

interface APICardProps {
  api: APIListing;
  onClick?: () => void;
}

const APICard: React.FC<APICardProps> = ({ api, onClick }) => {
  const CategoryIcon = getCategoryIcon(api.category || 'Other');
  const colorClass = getCategoryColor(api.category || 'Other');

  // Format date to show relative time
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 30) return `${diffDays} days ago`;
    
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    return `${month} ${day}`;
  };

  return (
    <div
      className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 hover:border-gray-700 hover:bg-gray-900/70 transition-all cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex items-start space-x-4">
        {/* Icon */}
        <div className={`w-12 h-12 bg-linear-to-br ${colorClass} rounded-lg flex items-center justify-center shrink-0`}>
          <CategoryIcon className="w-6 h-6 text-white" strokeWidth={2} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title and URL */}
          <div className="mb-1">
            <h3 className="font-semibold text-white group-hover:text-gray-200 transition-colors truncate">
              {api.name}
            </h3>
            <p className="text-sm text-gray-500 truncate">
              {api.baseUrl.replace(/^https?:\/\//, '')}
            </p>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-400 mb-3 line-clamp-1">
            {api.description || 'No description'}
          </p>

          {/* Footer info */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-3 text-gray-500">
              <span className="flex items-center space-x-1">
                <span>💰</span>
                <span>{api.pricePerCall} usd/call</span>
              </span>
              <span>•</span>
              <span>{formatDate(api.createdAt)}</span>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              api.status === 'active'
                ? 'bg-green-900/30 text-green-400'
                : 'bg-gray-800 text-gray-400'
            }`}>
              {api.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default APICard;
