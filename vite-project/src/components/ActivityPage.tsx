import React, { useState, useEffect } from "react";
import {
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { usageService } from "../services/api.service";
import type { UsageRecord, UsageStats } from "../services/api.service";
import { useAuth } from "../context/AuthContext";

interface ActivityEvent {
  id: string;
  timestamp: string;
  type: "request" | "deployment" | "error" | "update";
  apiName: string;
  endpoint?: string;
  status: "success" | "failed" | "pending";
  details: string;
  userAddress: string;
  cost: string;
}

const ActivityPage: React.FC = () => {
  const { walletAddress } = useAuth();
  const [timeRange, setTimeRange] = useState("24h");
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [stats, setStats] = useState<UsageStats>({
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    totalRevenue: "0",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Transform usage record to activity event
  const transformUsageToActivity = (usage: UsageRecord): ActivityEvent => ({
    id: usage.id,
    timestamp: new Date(usage.timestamp).toLocaleString(),
    type: usage.success ? "request" : "error",
    apiName: usage.api_name,
    status: usage.success ? "success" : "failed",
    details: usage.error || `API call ${usage.success ? "completed successfully" : "failed"}`,
    userAddress: usage.user_address,
    cost: usage.cost,
  });

  // Fetch activity data
  const fetchActivityData = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Fetch usage data and stats
      const [usageData, statsData] = await Promise.all([
        walletAddress 
          ? usageService.getUsageByOwner(walletAddress, 100)
          : usageService.getAllUsage(100),
        walletAddress
          ? usageService.getUsageStats(walletAddress, timeRange)
          : usageService.getUsageStats(undefined, timeRange),
      ]);

      // Transform usage records to activities
      const transformedActivities = usageData.map(transformUsageToActivity);
      setActivities(transformedActivities);
      setStats(statsData);
    } catch (err) {
      console.error("Error fetching activity data:", err);
      setError("Failed to load activity data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch data on component mount and when time range changes
  useEffect(() => {
    fetchActivityData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange, walletAddress]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchActivityData(true);
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange, walletAddress]);

  const handleRefresh = () => {
    fetchActivityData(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "failed":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "pending":
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  const getActivityTypeLabel = (type: string) => {
    switch (type) {
      case "request":
        return "API Request";
      case "deployment":
        return "Deployment";
      case "error":
        return "Error";
      case "update":
        return "Update";
      default:
        return "Activity";
    }
  };

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Activity</h1>
          <p className="text-gray-400">
            Monitor all activity for your hosted APIs
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-3 py-2 bg-gray-900 border border-gray-700 rounded hover:bg-gray-800 text-sm flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 bg-gray-900 border border-gray-700 rounded hover:bg-gray-800 text-sm"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-900 rounded-lg flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium text-red-400 text-sm mb-1">Error</h4>
            <p className="text-xs text-red-300">{error}</p>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm text-gray-400">Total Requests</h3>
            <Activity className="w-4 h-4 text-gray-500" />
          </div>
          <div className="text-3xl font-bold mb-2">{loading ? '-' : stats.totalRequests.toLocaleString()}</div>
          <div className="text-sm text-gray-500">
            {loading ? 'Loading...' : stats.totalRequests === 0 ? 'No activity yet' : 'All time'}
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm text-gray-400">Successful</h3>
            <CheckCircle className="w-4 h-4 text-green-500" />
          </div>
          <div className="text-3xl font-bold mb-2 text-green-400">
            {loading ? '-' : stats.successfulRequests.toLocaleString()}
          </div>
          <div className="text-sm text-gray-500">
            {loading ? 'Loading...' : stats.totalRequests > 0 ? `${((stats.successfulRequests / stats.totalRequests) * 100).toFixed(1)}% success rate` : 'No requests'}
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm text-gray-400">Failed</h3>
            <XCircle className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-3xl font-bold mb-2 text-red-400">
            {loading ? '-' : stats.failedRequests.toLocaleString()}
          </div>
          <div className="text-sm text-gray-500">
            {loading ? 'Loading...' : stats.totalRequests > 0 ? `${((stats.failedRequests / stats.totalRequests) * 100).toFixed(1)}% failure rate` : 'No failures'}
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm text-gray-400">Revenue Earned</h3>
            <Activity className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-3xl font-bold mb-2 text-purple-400">
            ${loading ? '-' : parseFloat(stats.totalRevenue).toFixed(2)}
          </div>
          <div className="text-sm text-gray-500">
            {loading ? 'Loading...' : 'Total earned'}
          </div>
        </div>
      </div>

      {/* Activity List */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent Activity</h2>
            {activities.length > 0 && (
              <span className="text-sm text-gray-500">
                {activities.length} record{activities.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-gray-600 border-t-white rounded-full animate-spin"></div>
            <p className="mt-4 text-sm text-gray-400">Loading activity...</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="p-12 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center">
                <Activity className="w-8 h-8 text-gray-600" />
              </div>
            </div>
            <h3 className="text-lg font-medium mb-2">No Activity Yet</h3>
            <p className="text-gray-400 mb-4">
              Activity from your hosted APIs will appear here once they start
              receiving requests.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="p-6 hover:bg-gray-850 transition-colors"
              >
                <div className="flex items-start space-x-4">
                  <div className="shrink-0 mt-1">
                    {getStatusIcon(activity.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2 flex-wrap">
                        <span className="font-medium">
                          {getActivityTypeLabel(activity.type)}
                        </span>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-400">
                          {activity.apiName}
                        </span>
                        <span className="text-gray-500">•</span>
                        <span className="text-xs text-purple-400">
                          ${parseFloat(activity.cost).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>{activity.timestamp}</span>
                      </div>
                    </div>
                    {activity.endpoint && (
                      <code className="text-xs text-blue-400 block mb-1">
                        {activity.endpoint}
                      </code>
                    )}
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-400">{activity.details}</p>
                      <p className="text-xs text-gray-600 font-mono">
                        User: {activity.userAddress.slice(0, 6)}...{activity.userAddress.slice(-4)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityPage;
