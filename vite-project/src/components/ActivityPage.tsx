import React, { useState } from "react";
import {
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

interface ActivityEvent {
  id: string;
  timestamp: string;
  type: "request" | "deployment" | "error" | "update";
  apiName: string;
  endpoint?: string;
  status: "success" | "failed" | "pending";
  details: string;
}

const ActivityPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState("24h");
  const [activities] = useState<ActivityEvent[]>([]);

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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm text-gray-400">Total Requests</h3>
            <Activity className="w-4 h-4 text-gray-500" />
          </div>
          <div className="text-3xl font-bold mb-2">0</div>
          <div className="text-sm text-gray-500">No activity yet</div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm text-gray-400">Successful Requests</h3>
            <CheckCircle className="w-4 h-4 text-green-500" />
          </div>
          <div className="text-3xl font-bold mb-2">0</div>
          <div className="text-sm text-gray-500">No successful requests</div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm text-gray-400">Failed Requests</h3>
            <XCircle className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-3xl font-bold mb-2">0</div>
          <div className="text-sm text-gray-500">No failed requests</div>
        </div>
      </div>

      {/* Activity List */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-xl font-semibold">Recent Activity</h2>
        </div>

        {activities.length === 0 ? (
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
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">
                          {getActivityTypeLabel(activity.type)}
                        </span>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-400">
                          {activity.apiName}
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
                    <p className="text-sm text-gray-400">{activity.details}</p>
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
