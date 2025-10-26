'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ReviewBatch {
  batch_id: string;
  batch_name: string;
  status: string;
  created_at: string;
  business_units?: {
    name: string;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const [reviewBatches, setReviewBatches] = useState<ReviewBatch[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);

  useEffect(() => {
    fetchReviewBatches();
  }, []);

  const fetchReviewBatches = async () => {
    try {
      setIsLoadingReviews(true);
      const response = await fetch('/api/review-batches');
      if (response.ok) {
        const data = await response.json();
        setReviewBatches(data.batches || []);
      }
    } catch (error) {
      console.error('Error fetching review batches:', error);
    } finally {
      setIsLoadingReviews(false);    }
  };

  const getBatchStatusInfo = (status: string) => {
    const statusMap: Record<string, { label: string; icon: string; color: string; needsAction: boolean }> = {
      'review_pending': {
        label: 'Perlu Review',
        icon: '👀',
        color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        needsAction: true
      },
      'kpi_loading': {
        label: 'AI Memproses KPI',
        icon: '🔄',
        color: 'bg-purple-100 text-purple-700 border-purple-200',
        needsAction: false
      },
      'KPI_Assignment_Pending': {
        label: 'Selesai - Lihat Hasil',
        icon: '✅',
        color: 'bg-green-100 text-green-700 border-green-200',
        needsAction: false
      },
      'Analyzing': {
        label: 'Sedang Dianalisa',
        icon: '🤖',
        color: 'bg-blue-100 text-blue-700 border-blue-200',
        needsAction: false
      },
    };

    return statusMap[status] || {
      label: status,
      icon: '❓',
      color: 'bg-gray-100 text-gray-700 border-gray-200',
      needsAction: false
    };
  };

  // Separate batches by status
  const pendingReview = reviewBatches.filter(b => b.status === 'review_pending');
  const kpiLoadingBatches = reviewBatches.filter(b => b.status === 'kpi_loading');
  const completedBatches = reviewBatches.filter(b => b.status === 'KPI_Assignment_Pending');
  const analyzingBatches = reviewBatches.filter(b => b.status === 'Analyzing');


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-2">
          Selamat datang di HRIS Next Gen Performance Management System
        </p>
      </div>      {/* Review Pending Alert */}
      {pendingReview.length > 0 && (
        <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">⚠️</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-orange-900 mb-1">
                  📝 Ada {pendingReview.length} Strategi yang Perlu Di-Review!
                </h3>
                <p className="text-sm text-orange-700 mb-3">
                  AI sudah selesai menganalisis dan membuat rekomendasi. Silakan review sebelum dilanjutkan.
                </p>
                <div className="space-y-2">
                  {pendingReview.map((batch) => {
                    const statusInfo = getBatchStatusInfo(batch.status);
                    return (
                      <button
                        key={batch.batch_id}
                        onClick={() => router.push(`/dashboard/review/${batch.batch_id}`)}
                        className="flex items-center space-x-3 bg-white hover:bg-orange-50 border border-orange-200 rounded-lg px-4 py-3 transition-colors w-full text-left group"
                      >
                        <span className="text-2xl">{statusInfo.icon}</span>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 group-hover:text-orange-700">
                            {batch.batch_name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-gray-600">
                              {batch.business_units?.name} • {new Date(batch.created_at).toLocaleDateString('id-ID')}
                            </p>
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${statusInfo.color}`}>
                              {statusInfo.label}
                            </span>
                          </div>
                        </div>
                        <span className="text-orange-600 group-hover:text-orange-700">→</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Completed/Analyzing Batches */}
      {(completedBatches.length > 0 || analyzingBatches.length > 0) && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">✅</span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-green-900 mb-1">
                📊 Status Analisa Strategi
              </h3>
              <p className="text-sm text-green-700 mb-3">
                Hasil analisa AI dan workflow yang sudah selesai.
              </p>              <div className="space-y-2">
                {[...completedBatches, ...analyzingBatches].map((batch) => {
                  const statusInfo = getBatchStatusInfo(batch.status);
                  const isAssignmentPending = batch.status === 'KPI_Assignment_Pending';
                  const navigationUrl = isAssignmentPending 
                    ? `/dashboard/kpis/${batch.batch_id}`
                    : `/dashboard/review/${batch.batch_id}`;
                  
                  return (
                    <button
                      key={batch.batch_id}
                      onClick={() => router.push(navigationUrl)}
                      className="flex items-center space-x-3 bg-white hover:bg-green-50 border border-green-200 rounded-lg px-4 py-3 transition-colors w-full text-left group"
                    >
                      <span className="text-2xl">{statusInfo.icon}</span>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 group-hover:text-green-700">
                          {batch.batch_name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-gray-600">
                            {batch.business_units?.name} • {new Date(batch.created_at).toLocaleDateString('id-ID')}
                          </p>
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                        </div>
                      </div>
                      <span className="text-green-600 group-hover:text-green-700">→</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {isLoadingReviews && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-center space-x-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
            <span className="text-gray-600">Checking for pending reviews...</span>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Goals</p>
              <p className="text-3xl font-bold text-gray-900">2</p>
              <p className="text-xs text-green-600 mt-1">↑ Active</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🎯</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pending KPIs</p>
              <p className="text-3xl font-bold text-gray-900">0</p>
              <p className="text-xs text-yellow-600 mt-1">⏳ Awaiting</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Completed Tasks</p>
              <p className="text-3xl font-bold text-gray-900">0</p>
              <p className="text-xs text-gray-500 mt-1">This month</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">AI Suggestions</p>
              <p className="text-3xl font-bold text-gray-900">0</p>
              <p className="text-xs text-purple-600 mt-1">Ready to review</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🤖</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xl">🎯</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Goal Created: Impressi & Follower</p>
              <p className="text-xs text-gray-600 mt-1">DRW Estetika • Just now</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
