'use client';

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
        <p className="text-gray-600 mt-2">
          Track performance metrics dan goal achievement progress
        </p>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Goal Completion Rate */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Goal Completion Rate
          </h3>
          <div className="h-48 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-5xl font-bold text-blue-600 mb-2">0%</div>
              <p className="text-sm text-gray-600">No completed goals yet</p>
            </div>
          </div>
        </div>

        {/* KPI Performance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            KPI Performance
          </h3>
          <div className="h-48 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <span className="text-4xl mb-2 block">📊</span>
              <p className="text-sm text-gray-600">No KPI data available</p>
            </div>
          </div>
        </div>

        {/* Task Completion Trend */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Daily Task Completion
          </h3>
          <div className="h-48 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <span className="text-4xl mb-2 block">📈</span>
              <p className="text-sm text-gray-600">Start tracking tasks to see trends</p>
            </div>
          </div>
        </div>

        {/* Team Performance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Team Performance
          </h3>
          <div className="h-48 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <span className="text-4xl mb-2 block">👥</span>
              <p className="text-sm text-gray-600">Team metrics coming soon</p>
            </div>
          </div>
        </div>
      </div>

      {/* Business Units Performance */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Business Units Performance
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-lg">🏢</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">DRW Estetika</p>
                <p className="text-sm text-gray-600">Skincare & Beauty</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">2 Active Goals</p>
              <p className="text-xs text-gray-500">0% Completed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
