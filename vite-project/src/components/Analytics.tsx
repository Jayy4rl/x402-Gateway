import React, { useState } from "react";
import { TrendingUp, TrendingDown, Download, Calendar } from "lucide-react";

const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState("30days");

  const performanceData = [
    {
      endpoint: "/v1/forecast",
      calls: 847,
      revenue: "1,694 usd",
      avgTime: "142ms",
      success: "99.2%",
    },
    {
      endpoint: "/v1/current",
      calls: 234,
      revenue: "468 usd",
      avgTime: "98ms",
      success: "100%",
    },
    {
      endpoint: "/v1/alerts",
      calls: 166,
      revenue: "332 usd",
      avgTime: "156ms",
      success: "98.8%",
    },
    {
      endpoint: "/v1/subscribe",
      calls: 89,
      revenue: "178 usd",
      avgTime: "201ms",
      success: "97.5%",
    },
  ];

  const geographicData = [
    { country: "United States", flag: "🇺🇸", requests: 19281, percentage: 45 },
    { country: "United Kingdom", flag: "🇬🇧", requests: 9426, percentage: 22 },
    { country: "Germany", flag: "🇩🇪", requests: 5142, percentage: 12 },
    { country: "Canada", flag: "🇨🇦", requests: 3427, percentage: 8 },
    { country: "France", flag: "🇫🇷", requests: 2571, percentage: 6 },
  ];

  const recentTransactions = [
    {
      time: "2 min ago",
      user: "user_abc",
      endpoint: "GET /v1/forecast",
      amount: "2 usd",
      status: "success",
    },
    {
      time: "5 min ago",
      user: "user_xyz",
      endpoint: "GET /v1/current",
      amount: "2 usd",
      status: "success",
    },
    {
      time: "8 min ago",
      user: "user_123",
      endpoint: "GET /v1/forecast",
      amount: "2 usd",
      status: "success",
    },
    {
      time: "12 min ago",
      user: "user_456",
      endpoint: "GET /v1/alerts",
      amount: "5 usd",
      status: "success",
    },
    {
      time: "15 min ago",
      user: "user_789",
      endpoint: "POST /v1/subscribe",
      amount: "10 usd",
      status: "success",
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-white flex items-center justify-center">
              <span className="text-black font-bold">▲</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-purple-600 rounded-full"></div>
              <span className="text-sm">provider-name's APIs</span>
              <span className="text-gray-500 text-sm">Hobby</span>
              <span className="text-gray-600">/</span>
              <span className="text-sm">weather-forecast-api</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="px-3 py-1.5 text-sm hover:bg-gray-900 rounded">
              Find...
            </button>
            <span className="text-sm">F</span>
            <button className="px-3 py-1.5 text-sm hover:bg-gray-900 rounded">
              Feedback
            </button>
            <button className="w-8 h-8 bg-yellow-400 rounded-full"></button>
          </div>
        </div>

        <nav className="flex items-center space-x-6 px-6 text-sm border-t border-gray-800">
          <button className="py-3 text-gray-400 hover:text-white">
            Overview
          </button>
          <button className="py-3 text-gray-400 hover:text-white">
            Deployments
          </button>
          <button className="py-3 border-b-2 border-white">Analytics</button>
          <button className="py-3 text-gray-400 hover:text-white">
            Speed Insights
          </button>
          <button className="py-3 text-gray-400 hover:text-white">Logs</button>
          <button className="py-3 text-gray-400 hover:text-white">
            Observability
          </button>
          <button className="py-3 text-gray-400 hover:text-white">
            Settings
          </button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="px-6 py-8 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Analytics - Weather Forecast API
            </h1>
            <p className="text-gray-400">
              Monitor your API performance and revenue
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-2 border border-gray-700 rounded hover:bg-gray-900 text-sm flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="bg-transparent border-none text-sm focus:outline-none"
              >
                <option value="24h">Last 24 Hours</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
              </select>
            </button>
            <button className="px-4 py-2 bg-white text-black rounded hover:bg-gray-200 text-sm font-medium flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="text-sm text-gray-400 mb-2">Total Requests</div>
            <div className="text-3xl font-bold mb-2">42,847</div>
            <div className="flex items-center space-x-1 text-sm text-green-400">
              <TrendingUp className="w-4 h-4" />
              <span>12% from last period</span>
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="text-sm text-gray-400 mb-2">Total Revenue</div>
            <div className="text-3xl font-bold mb-2">2,450 usd</div>
            <div className="flex items-center space-x-1 text-sm text-green-400">
              <TrendingUp className="w-4 h-4" />
              <span>8% from last period</span>
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="text-sm text-gray-400 mb-2">Success Rate</div>
            <div className="text-3xl font-bold mb-2">99.2%</div>
            <div className="flex items-center space-x-1 text-sm text-green-400">
              <TrendingUp className="w-4 h-4" />
              <span>0.3% from last period</span>
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="text-sm text-gray-400 mb-2">Avg Response Time</div>
            <div className="text-3xl font-bold mb-2">156ms</div>
            <div className="flex items-center space-x-1 text-sm text-red-400">
              <TrendingDown className="w-4 h-4" />
              <span>5ms from last period</span>
            </div>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6">Revenue Over Time</h2>
          <div className="h-64 flex items-end justify-between space-x-2">
            {[2100, 1800, 2400, 1900, 2200, 2600, 2450].map((value, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-gradient-to-t from-purple-600 to-purple-400 rounded-t"
                  style={{ height: `${(value / 3000) * 100}%` }}
                ></div>
                <div className="text-xs text-gray-500 mt-2">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index]}
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-4 text-sm text-gray-400">
            <span>0 usd</span>
            <span>1,500 usd</span>
            <span>3,000 usd</span>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Endpoints */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Top Endpoints</h2>
              <button className="text-sm text-blue-400 hover:underline">
                View All
              </button>
            </div>
            <div className="space-y-4">
              {performanceData.map((endpoint, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-3 border-b border-gray-800 last:border-0"
                >
                  <div className="flex-1">
                    <div className="font-mono text-sm mb-1">
                      {endpoint.endpoint}
                    </div>
                    <div className="text-xs text-gray-500">
                      {endpoint.calls} calls • {endpoint.avgTime} avg •{" "}
                      {endpoint.success} success
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{endpoint.revenue}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue Breakdown */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6">
              Revenue by User Segment
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Enterprise</span>
                  <span className="text-sm font-semibold">45%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{ width: "45%" }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Pro Users</span>
                  <span className="text-sm font-semibold">35%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: "35%" }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Free Trial</span>
                  <span className="text-sm font-semibold">20%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: "20%" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Geographic Distribution */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6">
            Geographic Distribution
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              {geographicData.map((country, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{country.flag}</span>
                    <span className="text-sm">{country.country}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-32 bg-gray-800 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: `${country.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-400 w-12 text-right">
                      {country.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-gray-800 rounded-lg h-64 flex items-center justify-center text-gray-500">
              🗺️ World Map Visualization
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Recent Transactions</h2>
            <button className="text-sm text-blue-400 hover:underline">
              View All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">
                    Time
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">
                    User
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">
                    Endpoint
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">
                    Amount
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((tx, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-800 last:border-0 hover:bg-gray-850"
                  >
                    <td className="py-3 px-4 text-sm text-gray-400">
                      {tx.time}
                    </td>
                    <td className="py-3 px-4 text-sm font-mono">{tx.user}</td>
                    <td className="py-3 px-4 text-sm font-mono">
                      {tx.endpoint}
                    </td>
                    <td className="py-3 px-4 text-sm">{tx.amount}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-green-900 text-green-300 rounded text-xs">
                        ✓
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Analytics;
