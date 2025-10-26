'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface AIRecommendedRole {
  role_recommendation_id: string;
  role_name: string;
  responsibilities: string;
}

interface ProposedBreakdown {
  breakdown_id: string;
  name: string;
  value: string;
  unit?: string;
  description?: string;
}

interface ProposedKPI {
  kpi_id: string;
  kpi_description: string;
  kpi_target_value: string;
  kpi_target_unit: string;
  status: string;
  ai_recommended_roles: AIRecommendedRole;
  proposed_breakdowns: ProposedBreakdown;
}

export default function KPIsPage() {
  const router = useRouter();
  const params = useParams();
  const batch_id = params.batch_id as string;

  const [kpis, setKpis] = useState<ProposedKPI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!batch_id) {
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const kpisResponse = await fetch(`/api/assign/${batch_id}`);
        
        if (!kpisResponse.ok) {
          const errorData = await kpisResponse.json().catch(() => ({}));
          throw new Error(errorData.message || `Failed to fetch KPIs (${kpisResponse.status})`);
        }
        const kpisData = await kpisResponse.json();
        setKpis(kpisData.kpis || []);

      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [batch_id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="ml-4 text-gray-600">Loading KPIs...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && kpis.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">❌ {error}</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              ← Kembali ke Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="mb-4 text-blue-600 hover:text-blue-800 flex items-center gap-2"
          >
            ← Kembali ke Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            KPI Review - Batch {batch_id}
          </h1>
          <p className="text-gray-600 mt-2">
            Review KPI yang telah di-generate AI beserta rekomendasi role dan breakdown target.
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">⚠️ {error}</p>
          </div>
        )}

        {kpis.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">Tidak ada KPI untuk batch ini.</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Ke Dashboard
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-6 mb-8">
              {kpis.map((kpi, index) => (
                <div
                  key={kpi.kpi_id}
                  className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <span className="flex-shrink-0 w-10 h-10 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-lg">
                      {index + 1}
                    </span>

                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">
                        {kpi.kpi_description}
                      </h3>

                      <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 rounded-lg w-fit">
                        <span className="text-sm font-medium text-gray-700">🎯 Target:</span>
                        <span className="text-2xl font-bold text-blue-600">
                          {kpi.kpi_target_value}
                        </span>
                        <span className="text-lg font-medium text-blue-700">
                          {kpi.kpi_target_unit}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">👤</span>
                            <span className="text-sm font-semibold text-gray-700">
                              Role yang Direkomendasikan AI
                            </span>
                          </div>
                          <p className="text-base font-bold text-purple-900">
                            {kpi.ai_recommended_roles?.role_name || 'N/A'}
                          </p>
                          {kpi.ai_recommended_roles?.responsibilities && (
                            <p className="text-sm text-gray-600 mt-2">
                              {kpi.ai_recommended_roles.responsibilities}
                            </p>
                          )}
                        </div>

                        {kpi.proposed_breakdowns && (
                          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-lg">📊</span>
                              <span className="text-sm font-semibold text-gray-700">
                                Parent Target Breakdown
                              </span>
                            </div>
                            <p className="text-base font-bold text-green-900">
                              {kpi.proposed_breakdowns.name}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              Target: <span className="font-semibold">{kpi.proposed_breakdowns.value} {kpi.proposed_breakdowns.unit}</span>
                            </p>
                            {kpi.proposed_breakdowns.description && (
                              <p className="text-xs text-gray-500 mt-2">
                                {kpi.proposed_breakdowns.description}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      <div>
                        <span className="inline-flex items-center px-4 py-2 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                          <span className="mr-1">📌</span>
                          Status: {kpi.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold text-gray-900">
                    Total KPIs: {kpis.length}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Semua KPI telah di-generate oleh AI dengan rekomendasi role
                  </p>
                </div>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center gap-2"
                >
                  <span>✓</span>
                  Kembali ke Dashboard
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
