import React, { useState } from "react";
import {
  Search,
  Grid,
  List,
  MoreVertical,
  Activity,
  TrendingUp,
  Link2,
  ExternalLink,
  Shield,
  Download,
  Calendar,
  Zap,
  Database,
  Cloud,
  Code,
  Server,
} from "lucide-react";
import { useAuth } from "./context/AuthContext";
import LoginPage from "./components/LoginPage";
import MarketplaceListingPage from "./components/MarketplaceListingPage";
import ActivityPage from "./components/ActivityPage";
import WalletButton from "./components/WalletButton";

type Page =
  | "dashboard"
  | "new-project"
  | "project-overview"
  | "analytics"
  | "marketplace-listing"
  | "activity";

const App: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Show authenticated content
  return (
    <div>
      {currentPage === "dashboard" && <Dashboard onNavigate={setCurrentPage} />}
      {currentPage === "new-project" && (
        <NewProject onNavigate={setCurrentPage} />
      )}
      {currentPage === "marketplace-listing" && (
        <MarketplaceListingPage
          onNavigate={(page) => setCurrentPage(page as Page)}
        />
      )}
      {currentPage === "project-overview" && (
        <ProjectOverview onNavigate={setCurrentPage} />
      )}
      {currentPage === "analytics" && <Analytics onNavigate={setCurrentPage} />}
      {currentPage === "activity" && (
        <ActivityPageWrapper onNavigate={setCurrentPage} />
      )}
    </div>
  );
};

// Activity Page Wrapper
const ActivityPageWrapper: React.FC<{ onNavigate: (page: Page) => void }> = ({
  onNavigate,
}) => {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header onNavigate={onNavigate} currentPage="activity" />
      <ActivityPage />
    </div>
  );
};

// Shared Header Component
const Header: React.FC<{
  onNavigate: (page: Page) => void;
  currentPage: string;
  projectName?: string;
}> = ({ onNavigate, currentPage, projectName }) => {
  return (
    <header className="border-b border-gray-800">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <div
            className="w-8 h-8 bg-white flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
            onClick={() => onNavigate("dashboard")}
          >
            <span className="text-black font-bold">▲</span>
          </div>
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-purple-600" />
            <span
              className="text-sm cursor-pointer hover:text-gray-300"
              onClick={() => onNavigate("dashboard")}
            >
              provider-name's APIs
            </span>
            <span className="text-gray-500 text-sm">Hobby</span>
            {projectName && (
              <>
                <span className="text-gray-600">/</span>
                <span className="text-sm">{projectName}</span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button className="px-3 py-1.5 text-sm hover:bg-gray-900 rounded">
            Feedback
          </button>
          <WalletButton />
        </div>
      </div>

      <nav className="flex items-center space-x-6 px-6 text-sm border-t border-gray-800">
        <button
          className={`py-3 ${
            currentPage === "dashboard"
              ? "border-b-2 border-white"
              : "text-gray-400 hover:text-white"
          }`}
          onClick={() => onNavigate("dashboard")}
        >
          APIs
        </button>
        <button
          className={`py-3 ${
            currentPage === "activity"
              ? "border-b-2 border-white"
              : "text-gray-400 hover:text-white"
          }`}
          onClick={() => onNavigate("activity")}
        >
          Activity
        </button>
        <button className={`py-3 text-gray-400 hover:text-white`}>
          Settings
        </button>
      </nav>
    </header>
  );
};

// Dashboard Component - No dummy data
const Dashboard: React.FC<{ onNavigate: (page: Page) => void }> = ({
  onNavigate,
}) => {
  const apis: Array<{
    id: number;
    name: string;
    url: string;
    repo: string;
    status: string;
    lastUpdate: string;
    branch: string;
    requests: string;
    revenue: string;
  }> = [];

  return (
    <div className="min-h-screen bg-black text-white">
      <Header onNavigate={onNavigate} currentPage="dashboard" />

      <main className="px-6 py-8 max-w-7xl mx-auto">
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
              className="px-4 py-2 bg-white text-black rounded text-sm font-medium hover:bg-gray-200"
              onClick={() => onNavigate("marketplace-listing")}
            >
              Add New...
            </button>
          </div>
        </div>

        {/* Usage Section - No Data State */}
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
                <span className="text-sm text-gray-500">No data</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">Revenue</span>
                </div>
                <span className="text-sm text-gray-500">No data</span>
              </div>
            </div>
          </div>
        </div>

        {/* APIs List - Empty State */}
        <div>
          <h2 className="text-lg font-semibold mb-4">APIs</h2>
          {apis.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center">
                  <Server className="w-8 h-8 text-gray-600" />
                </div>
              </div>
              <h3 className="text-lg font-medium mb-2">No APIs Yet</h3>
              <p className="text-gray-400 mb-6">
                Get started by deploying your first API to the marketplace
              </p>
              <button
                onClick={() => onNavigate("marketplace-listing")}
                className="px-6 py-3 bg-white text-black rounded text-sm font-medium hover:bg-gray-200 inline-flex items-center space-x-2"
              >
                <Zap className="w-4 h-4" />
                <span>Deploy Your First API</span>
              </button>
            </div>
          ) : (
            <div className="space-y-0 border border-gray-800 rounded-lg overflow-hidden">
              {apis.map((api, index) => (
                <div
                  key={api.id}
                  className={`bg-gray-900 p-6 flex items-center justify-between hover:bg-gray-850 transition-colors cursor-pointer ${
                    index !== 0 ? "border-t border-gray-800" : ""
                  }`}
                  onClick={() => onNavigate("project-overview")}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-purple-600 rounded flex items-center justify-center">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-medium">{api.name}</h3>
                        <span
                          className={`px-2 py-0.5 text-xs rounded ${
                            api.status === "Live"
                              ? "bg-green-900 text-green-300"
                              : "bg-gray-700 text-gray-300"
                          }`}
                        >
                          {api.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-400">{api.url}</div>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span>{api.repo}</span>
                        <span>•</span>
                        <span>
                          {api.lastUpdate} on {api.branch}
                        </span>
                        <span>•</span>
                        <span>{api.requests}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <div className="text-sm font-medium">{api.revenue}</div>
                      <div className="text-xs text-gray-500">Revenue</div>
                    </div>
                    <button className="p-2 hover:bg-gray-800 rounded">
                      <Activity className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-gray-800 rounded">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

// New Project Component with realistic icons
const NewProject: React.FC<{ onNavigate: (page: Page) => void }> = ({
  onNavigate,
}) => {
  const repos = [
    { name: "Weather-API", date: "Oct 28", IconComponent: Cloud },
    { name: "speedrun-dex", date: "Oct 26", IconComponent: Zap },
    { name: "Lisk-Sea-Campaign", date: "Oct 26", IconComponent: TrendingUp },
    { name: "Lisk-sea-campaign-wk1", date: "Oct 18", IconComponent: Code },
    { name: "SETTLE", date: "Oct 6", IconComponent: Server },
  ];

  const templates = [
    {
      name: "Express.js REST API",
      description: "Get started with Express.js REST API in seconds.",
      IconComponent: Server,
    },
    {
      name: "FastAPI Template",
      description: "A full-featured Python FastAPI template built for X402",
      IconComponent: Code,
    },
    {
      name: "GraphQL API Starter",
      description: "GraphQL API that can be deployed to X402",
      IconComponent: Database,
    },
    {
      name: "Node.js Serverless",
      description: "Simple Node.js + X402 serverless example that serves APIs",
      IconComponent: Zap,
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <Header onNavigate={onNavigate} currentPage="new-project" />

      <main className="px-6 py-12 max-w-7xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4">Let's publish your API</h1>
          <button className="px-4 py-2 border border-purple-600 text-purple-400 rounded hover:bg-purple-900/20">
            👥 Collaborate on a Pro Trial
          </button>
        </div>

        <div className="mb-12">
          <div className="flex items-center space-x-2 max-w-3xl mx-auto">
            <div className="flex-1 relative">
              <Link2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Enter a Git repository URL to deploy..."
                className="w-full bg-black border border-gray-800 rounded pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-gray-600"
              />
            </div>
            <button className="px-6 py-3 bg-white text-black rounded text-sm font-medium hover:bg-gray-200">
              Continue
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold mb-6">Import Git Repository</h2>

            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  <select className="bg-transparent border-none text-sm focus:outline-none">
                    <option>Jayy4rt</option>
                  </select>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="bg-black border border-gray-700 rounded pl-9 pr-4 py-1.5 text-sm focus:outline-none focus:border-gray-600"
                  />
                </div>
              </div>

              <div className="space-y-0 border border-gray-800 rounded overflow-hidden">
                {repos.map((repo, index) => {
                  const RepoIcon = repo.IconComponent;
                  return (
                    <div
                      key={repo.name}
                      className={`flex items-center justify-between p-4 hover:bg-gray-800 cursor-pointer ${
                        index !== 0 ? "border-t border-gray-800" : ""
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
                          <RepoIcon className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                          <div className="font-medium">{repo.name}</div>
                          <div className="text-xs text-gray-500">
                            {repo.date}
                          </div>
                        </div>
                      </div>
                      <button className="px-4 py-1.5 border border-gray-700 rounded text-sm hover:bg-gray-800">
                        Import
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Clone Template</h2>
              <div className="flex items-center space-x-2">
                <button className="px-3 py-1.5 text-sm border border-gray-700 rounded hover:bg-gray-800">
                  Filter
                </button>
                <button className="px-3 py-1.5 text-sm text-blue-400 hover:underline">
                  Browse All →
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {templates.map((template) => {
                const TemplateIcon = template.IconComponent;
                return (
                  <div
                    key={template.name}
                    className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="w-20 h-20 bg-purple-600 rounded flex items-center justify-center shrink-0">
                        <TemplateIcon className="w-10 h-10 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-2">{template.name}</h3>
                        <p className="text-sm text-gray-400">
                          {template.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Simplified Project Overview with realistic icons
const ProjectOverview: React.FC<{ onNavigate: (page: Page) => void }> = ({
  onNavigate,
}) => {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header
        onNavigate={onNavigate}
        currentPage="overview"
        projectName="my-api"
      />

      <main className="px-6 py-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">My API</h1>
          <div className="flex items-center space-x-4">
            <button className="px-4 py-2 border border-gray-700 rounded hover:bg-gray-900 text-sm">
              Repository
            </button>
            <button className="px-4 py-2 bg-white text-black rounded hover:bg-gray-200 text-sm font-medium">
              Usage
            </button>
            <button className="px-4 py-2 border border-gray-700 rounded hover:bg-gray-900 text-sm flex items-center space-x-2">
              <span>Visit</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6">Production Deployment</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <div className="bg-linear-to-br from-blue-900 to-purple-900 rounded-lg p-8 h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-white bg-opacity-10 rounded-full flex items-center justify-center">
                    <Cloud className="w-10 h-10 text-white" />
                  </div>
                  <div className="text-lg font-semibold">API Service</div>
                  <div className="text-sm text-gray-300 mt-2">
                    Ready to deploy
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-2 space-y-4">
              <div>
                <div className="text-sm text-gray-400 mb-1">Status</div>
                <span className="px-2 py-1 bg-green-900 text-green-300 rounded text-xs font-medium">
                  Ready
                </span>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-1">Domain</div>
                <a href="#" className="text-blue-400 hover:underline text-sm">
                  my-api.x402.app
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Firewall</h3>
              <button
                className="text-sm text-blue-400 hover:underline"
                onClick={() => onNavigate("analytics")}
              >
                →
              </button>
            </div>
            <div className="flex items-center justify-center py-8">
              <Shield className="w-16 h-16 text-blue-500" />
            </div>
            <p className="text-center font-medium">Firewall is active</p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Observability</h3>
              <button
                className="text-sm text-blue-400 hover:underline"
                onClick={() => onNavigate("analytics")}
              >
                →
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">API Requests</span>
                <span className="text-gray-500">No data</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Success Rate</span>
                <span className="text-gray-500">No data</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Analytics</h3>
              <button
                className="text-sm text-blue-400 hover:underline"
                onClick={() => onNavigate("analytics")}
              >
                →
              </button>
            </div>
            <div className="flex items-center justify-center py-8">
              <Activity className="w-16 h-16 text-gray-600" />
            </div>
            <div className="text-center">
              <button
                className="px-3 py-1.5 text-sm bg-white text-black rounded hover:bg-gray-200 font-medium"
                onClick={() => onNavigate("analytics")}
              >
                View Analytics
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Analytics Component - No dummy data
const Analytics: React.FC<{ onNavigate: (page: Page) => void }> = ({
  onNavigate,
}) => {
  const [timeRange] = useState("30days");

  const getTimeRangeLabel = () => {
    if (timeRange === "7days") return "Last 7 days";
    if (timeRange === "30days") return "Last 30 days";
    return "Last 90 days";
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Header
        onNavigate={onNavigate}
        currentPage="analytics"
        projectName="my-api"
      />

      <main className="px-6 py-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Analytics</h1>
            <p className="text-gray-400">
              Monitor your API performance and revenue
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-2 border border-gray-700 rounded hover:bg-gray-900 text-sm flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>{getTimeRangeLabel()}</span>
            </button>
            <button className="px-3 py-2 border border-gray-700 rounded hover:bg-gray-900 text-sm flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm text-gray-400">Total Requests</h3>
              <Activity className="w-4 h-4 text-gray-500" />
            </div>
            <div className="text-3xl font-bold mb-2">0</div>
            <div className="text-sm text-gray-500">No data available</div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm text-gray-400">Revenue Earned</h3>
              <TrendingUp className="w-4 h-4 text-gray-500" />
            </div>
            <div className="text-3xl font-bold mb-2">0 sats</div>
            <div className="text-sm text-gray-500">No data available</div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm text-gray-400">Success Rate</h3>
              <Shield className="w-4 h-4 text-gray-500" />
            </div>
            <div className="text-3xl font-bold mb-2">—</div>
            <div className="text-sm text-gray-500">No data available</div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center">
              <Activity className="w-8 h-8 text-gray-600" />
            </div>
          </div>
          <h3 className="text-lg font-medium mb-2">No Analytics Data Yet</h3>
          <p className="text-gray-400">
            Analytics data will appear here once your API starts receiving
            requests
          </p>
        </div>
      </main>
    </div>
  );
};

export default App;
