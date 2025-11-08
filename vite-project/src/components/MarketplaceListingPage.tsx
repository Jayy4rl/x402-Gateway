import React, { useState, useEffect } from 'react';
import { Github, Plus, Search, X, Check, AlertCircle, ExternalLink, Code } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AddAPIModal from './Modals/AddAPIModal';
import { apiService, githubService } from '../services/api.service';
import type { APIListing, GitHubRepo, AddAPIFormData } from '../types/marketplace.types';

interface MarketplaceListingPageProps {
  onNavigate?: (page: string) => void;
}

const MarketplaceListingPage: React.FC<MarketplaceListingPageProps> = ({ onNavigate }) => {
  const { walletAddress } = useAuth();
  const [view, setView] = useState<'options' | 'github' | 'manual'>('options');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [githubToken, setGithubToken] = useState<string | null>(null);
  const [githubRepos, setGithubRepos] = useState<GitHubRepo[]>( []);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [apiListings, setApiListings] = useState<APIListing[]>([]);

  // Check for GitHub token in URL (after OAuth callback)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('github_token');
    if (token) {
      setGithubToken(token);
      setView('github');
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // Fetch GitHub repos when token is available
  useEffect(() => {
    if (githubToken && view === 'github') {
      fetchGitHubRepos();
    }
  }, [githubToken, view]);

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

  const fetchGitHubRepos = async () => {
    if (!githubToken) return;

    setLoading(true);
    setError(null);

    try {
      const repos = await githubService.getUserRepositories(githubToken);
      setGithubRepos(repos);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch repositories');
    } finally {
      setLoading(false);
    }
  };

  const handleGitHubConnect = async () => {
    setLoading(true);
    setError(null);

    try {
      const { authUrl } = await githubService.initiateOAuth();
      window.location.href = authUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to GitHub');
      setLoading(false);
    }
  };

  const handleManualAdd = () => {
    setIsModalOpen(true);
  };

  const handleManualSubmit = async (formData: AddAPIFormData) => {
    if (!walletAddress) {
      throw new Error('Please connect your wallet first');
    }

    const listing = await apiService.createListing({
      ...formData,
      owner: walletAddress,
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

  const handleImportFromGitHub = async (repo: GitHubRepo) => {
    if (!walletAddress) {
      setError('Please connect your wallet first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const listing = await apiService.createListing({
        name: repo.name,
        baseUrl: `https://api.github.com/repos/${repo.full_name}`,
        description: repo.description || `Imported from GitHub: ${repo.full_name}`,
        pricePerCall: 'free',
        category: repo.language || 'Other',
        owner: walletAddress,
        source: 'github',
        githubRepo: repo.html_url,
      });

      setSuccess(`API "${listing.name}" imported successfully from GitHub!`);
      await fetchApiListings();
      
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import repository');
    } finally {
      setLoading(false);
    }
  };

  const filteredRepos = githubRepos.filter(repo =>
    repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (repo.description && repo.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
        {view === 'options' && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">List Your API on the Marketplace</h2>
              <p className="text-gray-400 text-lg">
                Choose how you'd like to add your API to the marketplace
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Import from GitHub */}
              <div
                onClick={() => setView('github')}
                className="bg-gray-900 border border-gray-800 rounded-lg p-8 hover:border-purple-600 cursor-pointer transition-all group"
              >
                <div className="flex items-center justify-center w-16 h-16 bg-gray-800 rounded-lg mb-6 group-hover:bg-purple-900/30 transition-colors">
                  <Github className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Import from GitHub</h3>
                <p className="text-gray-400 mb-6">
                  Connect your GitHub account and import repositories directly to the marketplace
                </p>
                <ul className="space-y-2 text-sm text-gray-500">
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Quick and easy setup</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Auto-sync repository details</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Link to source code</span>
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
        )}

        {/* GitHub Import View */}
        {view === 'github' && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-2">Import from GitHub</h2>
                <p className="text-gray-400">
                  Select a repository to import to the marketplace
                </p>
              </div>
              <button
                onClick={() => {
                  setView('options');
                  setGithubToken(null);
                  setGithubRepos([]);
                }}
                className="px-4 py-2 border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors"
              >
                ← Back to Options
              </button>
            </div>

            {!githubToken ? (
              <div className="max-w-2xl mx-auto text-center py-12">
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-12">
                  <Github className="w-16 h-16 text-white mx-auto mb-6" />
                  <h3 className="text-2xl font-bold mb-4">Connect to GitHub</h3>
                  <p className="text-gray-400 mb-8">
                    Authorize access to your GitHub repositories to import them to the marketplace
                  </p>
                  <button
                    onClick={handleGitHubConnect}
                    disabled={loading}
                    className="px-8 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 inline-flex items-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        <span>Connecting...</span>
                      </>
                    ) : (
                      <>
                        <Github className="w-5 h-5" />
                        <span>Connect GitHub</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {/* Search */}
                <div className="mb-6">
                  <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search repositories..."
                      className="w-full bg-black border border-gray-800 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                {/* Repositories List */}
                {loading ? (
                  <div className="text-center py-12">
                    <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-400">Loading repositories...</p>
                  </div>
                ) : filteredRepos.length === 0 ? (
                  <div className="text-center py-12 bg-gray-900 border border-gray-800 rounded-lg">
                    <Code className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">
                      {searchTerm ? 'No repositories found matching your search' : 'No repositories found'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-0 border border-gray-800 rounded-lg overflow-hidden">
                    {filteredRepos.map((repo, index) => (
                      <div
                        key={repo.id}
                        className={`bg-gray-900 p-6 flex items-center justify-between hover:bg-gray-850 transition-colors ${
                          index !== 0 ? 'border-t border-gray-800' : ''
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold">{repo.name}</h3>
                            {repo.private && (
                              <span className="px-2 py-0.5 bg-yellow-900/30 border border-yellow-900 rounded text-xs text-yellow-300">
                                Private
                              </span>
                            )}
                            {repo.language && (
                              <span className="px-2 py-0.5 bg-gray-800 rounded text-xs text-gray-400">
                                {repo.language}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-400 mb-3">
                            {repo.description || 'No description available'}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>{repo.full_name}</span>
                            <span>•</span>
                            <span>Updated {new Date(repo.updated_at).toLocaleDateString()}</span>
                            <a
                              href={repo.html_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center space-x-1 text-purple-400 hover:text-purple-300"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <span>View on GitHub</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                        <button
                          onClick={() => handleImportFromGitHub(repo)}
                          disabled={loading}
                          className="ml-6 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition-colors disabled:opacity-50"
                        >
                          Import
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Recently Added APIs */}
        {apiListings.length > 0 && view === 'options' && (
          <div className="mt-16">
            <h3 className="text-2xl font-bold mb-6">Recently Added to Marketplace</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {apiListings.slice(0, 3).map((api) => (
                <div
                  key={api.id}
                  className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded flex items-center justify-center">
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

      {/* Add API Modal */}
      <AddAPIModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleManualSubmit}
      />
    </div>
  );
};

export default MarketplaceListingPage;
