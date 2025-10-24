'use client';

export default function KPIsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">KPI Approval</h1>
          <p className="text-gray-600 mt-2">
            Review dan approve KPI yang diusulkan oleh AI
          </p>
        </div>
        <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg text-sm font-medium">
          🔔 0 Pending Approvals
        </div>
      </div>

      {/* Empty State */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">✅</span>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No KPIs Pending Approval
        </h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          KPI yang diusulkan AI akan muncul di sini untuk Anda review dan approve.
          Mulai dengan membuat strategic goal terlebih dahulu.
        </p>
        <a
          href="/dashboard/goals/create"
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          <span className="mr-2">➕</span>
          Create New Goal
        </a>
      </div>
    </div>
  );
}
