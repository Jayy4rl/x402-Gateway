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

  return (
    <div
      className="bg-gray-900/50 border border-gray-800 rounded-xl p-5 hover:border-gray-700 hover:bg-gray-900 transition-all cursor-pointer group backdrop-blur-sm"
      onClick={onClick}
    >
      <div className="flex items-start space-x-4">
        {/* Icon with gradient background and improved styling */}
        <div className={`w-16 h-16 bg-gradient-to-br ${colorClass} rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:rotate-3 transition-all duration-300 shadow-xl`}>
          <CategoryIcon className="w-8 h-8 text-white drop-shadow-lg" strokeWidth={2.5} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title and Category */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-white text-lg mb-1.5 group-hover:text-purple-400 transition-colors truncate">
                {api.name}
              </h4>
              <span className="inline-block px-2.5 py-0.5 text-xs rounded-full bg-gray-800/80 text-gray-300 border border-gray-700/50 font-medium">
                {api.category || 'Other'}
              </span>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-400 mb-4 line-clamp-2 leading-relaxed">
            {api.description || 'No description available'}
          </p>

          {/* Price and Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-baseline space-x-1.5">
              <span className="text-sm font-semibold text-purple-400">{api.pricePerCall}</span>
              <span className="text-xs text-gray-500 font-medium">usd/call</span>
            </div>
            <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${
              api.status === 'active'
                ? 'bg-green-900/30 text-green-400 border border-green-700/50'
                : 'bg-gray-800/50 text-gray-400 border border-gray-700/50'
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
