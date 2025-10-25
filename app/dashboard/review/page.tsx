'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface AnalysisBatch {
  batch_id: string;
  batch_name: string;
  status: string;
  created_at: string;
  summary: string | null;
  business_units?: {
    bu_id: string;
    name: string;
    description: string | null;
  };
  users?: {
    user_id: string;
    name: string;
    email: string;
  };
}

export default function ReviewListPage() {
  const [batches, setBatches] = useState<AnalysisBatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/review-batches');
      const data = await response.json();
      setBatches(data);
    } catch (error) {
      console.error('Error fetching batches:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Checkpoint 1: Judul "Review AI Strategy"
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">🤖 Review AI Strategy</h1>
          <p className="text-gray-600 mt-2">
            Review dan edit hasil analisa AI sebelum generate KPI
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading...</span>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && batches.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Tidak ada strategi yang perlu di-review.
            </h3>
            <p className="text-gray-600 mb-6">
              Semua batch sudah direview atau belum ada analisa AI yang selesai.
            </p>
            <Link
              href="/dashboard/goals"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Kembali ke Goals
            </Link>
          </div>
        )}

        {/* Batch List */}
        {!isLoading && batches.length > 0 && (
          <div className="space-y-4">
            {batches.map((batch) => (
              <Link
                key={batch.batch_id}
                href={`/dashboard/review/${batch.batch_id}`}
                className="block"
              >
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-200 cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">
                        {batch.batch_name}
                      </h3>

                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">🏢 Business Unit:</span>
                          <span>{batch.business_units?.name || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">� Created by:</span>
                          <span>{batch.users?.name || 'Unknown'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">� Created:</span>
                          <span>{formatDate(batch.created_at)}</span>
                        </div>
                      </div>

                      {batch.summary && (
                        <div className="mt-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                          <p className="text-sm text-gray-700 line-clamp-2">
                            💡 {batch.summary}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="ml-6 flex items-center">
                      <span className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                        Review & Edit →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
