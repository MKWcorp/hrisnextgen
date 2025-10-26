'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBullseye, 
  faArrowLeft, 
  faCalendar, 
  faBuilding,
  faSpinner,
  faCheckCircle,
  faClockRotateLeft,
  faPlus
} from '@fortawesome/free-solid-svg-icons';
import BreakdownApproval from '@/components/BreakdownApproval';
import KPIApproval from '@/components/KPIApproval';

interface Goal {
  goal_id: string;
  goal_name: string;
  target_value: string;
  target_unit: string;
  start_date: string;
  end_date: string;
  status: string;
  created_at: string;
  batch_id?: string;
  business_units?: {
    name: string;
  };
  analysis_batches?: {
    batch_id: string;
    batch_name: string;
    status: string;
  };
}

export default function GoalsPage() {
  const router = useRouter();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [analyzingGoals, setAnalyzingGoals] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  
  // Polling states
  const [pollingBatchId, setPollingBatchId] = useState<string | null>(null);
  const [pollingActive, setPollingActive] = useState(false);
  const [pollingAttempts, setPollingAttempts] = useState(0);

  // Helper function to get user-friendly batch status
  const getBatchStatusInfo = (batchStatus?: string) => {
    if (!batchStatus) {
      return {
        label: 'Belum Dianalisa',
        color: 'bg-gray-100 text-gray-700',
        icon: '⏳',
        description: 'Belum melalui analisa AI'
      };
    }    const statusMap: Record<string, { label: string; color: string; icon: string; description: string }> = {
      'Draft': {
        label: 'Draft',
        color: 'bg-gray-100 text-gray-700',
        icon: '📝',
        description: 'Sedang dalam proses draft'
      },
      'kpi_loading': {
        label: 'AI Sedang Memproses',
        color: 'bg-purple-100 text-purple-700',
        icon: '🔄',
        description: 'AI sedang generate KPI (3-60 menit)'
      },
      'Analyzing': {
        label: 'Sedang Dianalisa AI',
        color: 'bg-blue-100 text-blue-700',
        icon: '🤖',
        description: 'AI sedang menganalisa'
      },
      'review_pending': {
        label: 'Menunggu Review',
        color: 'bg-yellow-100 text-yellow-700',
        icon: '👀',
        description: 'Perlu direview & disetujui'
      },
      'KPI_Assignment_Pending': {
        label: 'KPI Sudah Dibuat',
        color: 'bg-green-100 text-green-700',
        icon: '✅',
        description: 'Rekomendasi AI selesai'
      },
      'completed': {
        label: 'Selesai',
        color: 'bg-emerald-100 text-emerald-700',
        icon: '🎉',
        description: 'Workflow selesai'
      },
    };

    return statusMap[batchStatus] || {
      label: batchStatus,
      color: 'bg-gray-100 text-gray-700',
      icon: '❓',
      description: 'Status tidak diketahui'
    };
  };

  // Helper function to get action button for batch
  const getBatchAction = (goal: Goal) => {    if (!goal.analysis_batches?.batch_id) return null;

    const status = goal.analysis_batches.status;
    
    if (status === 'review_pending') {
      return {
        label: '👀 Review Sekarang',
        url: `/dashboard/review/${goal.analysis_batches.batch_id}`,
        color: 'bg-yellow-500 hover:bg-yellow-600 text-white'
      };
    }
      if (status === 'KPI_Assignment_Pending') {
      return {
        label: '✅ Lihat KPIs',
        url: `/dashboard/kpis/${goal.analysis_batches.batch_id}`,
        color: 'bg-green-500 hover:bg-green-600 text-white'
      };
    }

    return null;
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  // Polling effect - check status every 3 seconds
  useEffect(() => {
    if (!pollingActive || !pollingBatchId) return;

    const MAX_ATTEMPTS = 60; // Stop after 3 minutes (60 attempts * 3 seconds)

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/check-status/${pollingBatchId}`);
        const data = await response.json();

        setPollingAttempts(prev => prev + 1);

        if (data.status === 'review_pending' || data.status === 'completed') {
          // Analysis complete!
          clearInterval(pollInterval);
          setPollingActive(false);
          setPollingBatchId(null);
          setPollingAttempts(0);
          setAnalyzingGoals(false);
          setAnalysisResult('✅ Analisa selesai! Memuat ulang data...');
          
          // Refresh goals to show updated data
          await fetchGoals();
          router.refresh();
          
          // Clear success message after 3 seconds
          setTimeout(() => setAnalysisResult(null), 3000);
        } else if (pollingAttempts >= MAX_ATTEMPTS) {
          // Timeout after max attempts
          clearInterval(pollInterval);
          setPollingActive(false);
          setPollingBatchId(null);
          setPollingAttempts(0);
          setAnalyzingGoals(false);
          setAnalysisResult('⚠️ Analisa memakan waktu lama. Silakan refresh halaman untuk cek status.');
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 3000); // Poll every 3 seconds

    // Cleanup on unmount
    return () => clearInterval(pollInterval);
  }, [pollingActive, pollingBatchId, pollingAttempts, router]);

  const fetchGoals = async () => {
    try {
      const response = await fetch('/api/goals');
      const data = await response.json();
      setGoals(data);
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Awaiting Breakdown Approval':
        return 'bg-blue-100 text-blue-800';
      case 'Awaiting KPI Approval':
        return 'bg-purple-100 text-purple-800';
      case 'Active':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending':
        return faClockRotateLeft;
      case 'Active':
        return faCheckCircle;
      default:
        return faSpinner;
    }
  };

  const handleGoalClick = (goal: Goal) => {
    setSelectedGoalId(goal.goal_id);
    setSelectedGoal(goal);
  };

  const handleAnalyzeGoals = async () => {
    if (goals.length === 0) {
      alert('Tidak ada goals untuk dianalisa');
      return;
    }

    setAnalyzingGoals(true);
    setAnalysisResult(null);
    setPollingAttempts(0);

    try {
      const response = await fetch('/api/goals/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (response.ok) {
        if (data.dev_mode) {
          // Development mode - no n8n webhook
          const batchInfo = data.batch_id ? `\n📦 Batch ID: ${data.batch_id.substring(0, 8)}...` : '';
          setAnalysisResult(`✅ ${data.message}\n\n📊 Payload ready untuk ${data.goals_analyzed} goals. Setup n8n webhook untuk enable AI analysis.${batchInfo}`);
          setAnalyzingGoals(false);
        } else {
          // Production mode - start polling
          setPollingBatchId(data.batch_id);
          setPollingActive(true);
          // analyzingGoals stays true during polling
        }
      } else {
        // Show detailed error with help
        const errorMsg = data.message || data.error || 'Failed to trigger analysis';
        const helpMsg = data.help ? `\n\n💡 ${data.help}` : '';
        setAnalysisResult(`❌ ${errorMsg}${helpMsg}`);
        setAnalyzingGoals(false);
      }
    } catch (error) {
      console.error('Error analyzing goals:', error);
      setAnalysisResult('Error: Failed to connect to analysis service');
      setAnalyzingGoals(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <div className="flex items-center justify-center">
              <FontAwesomeIcon icon={faSpinner} className="w-8 h-8 text-blue-600 animate-spin" />
              <span className="ml-3 text-gray-600">Loading goals...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4" />
            Kembali
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Goal Management</h1>
              <p className="text-gray-600 mt-2">Review and manage strategic goals and AI-generated breakdowns</p>
            </div>
            {!selectedGoalId && (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleAnalyzeGoals}
                  disabled={analyzingGoals || goals.length === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {analyzingGoals ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />
                      {pollingActive ? `Polling... (${pollingAttempts})` : 'Menganalisa...'}
                    </>
                  ) : (
                    <>
                      🤖 Rekomendasi AI
                    </>
                  )}
                </button>
                <button
                  onClick={() => router.push('/dashboard/goals/create')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
                  Buat Goal Baru
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Analysis Result Alert */}
        {analysisResult && (
          <div className={`border rounded-lg p-4 flex items-start gap-3 ${
            analysisResult.startsWith('❌') 
              ? 'bg-red-50 border-red-200' 
              : 'bg-purple-50 border-purple-200'
          }`}>
            <span className="text-2xl">{analysisResult.startsWith('❌') ? '⚠️' : '🤖'}</span>
            <div className="flex-1">
              <h4 className={`font-semibold ${
                analysisResult.startsWith('❌') ? 'text-red-900' : 'text-purple-900'
              }`}>
                {analysisResult.startsWith('❌') ? 'Setup Required' : 'AI Analysis'}
              </h4>
              <p className={`text-sm mt-1 whitespace-pre-line ${
                analysisResult.startsWith('❌') ? 'text-red-700' : 'text-purple-700'
              }`}>
                {analysisResult}
              </p>
              {analysisResult.startsWith('❌') && (
                <button
                  onClick={() => setAnalysisResult(null)}
                  className="mt-3 text-xs text-red-600 hover:text-red-800 underline"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        )}

        {/* Polling Loading Animation */}
        {pollingActive && (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xl">
                  🤖
                </div>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-purple-900 mb-1">
                  AI sedang menganalisa goals Anda...
                </h4>
                <p className="text-sm text-purple-700 mb-2">
                  Memeriksa status analisa: <span className="font-mono font-semibold">{pollingAttempts}</span> kali
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-purple-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-full transition-all duration-300 animate-pulse"
                      style={{ width: `${Math.min((pollingAttempts / 60) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-purple-600 font-mono">
                    {Math.round((pollingAttempts / 60) * 100)}%
                  </span>
                </div>
                <p className="text-xs text-purple-600 mt-2">
                  💡 Jangan tutup halaman ini. Refresh otomatis akan dilakukan setelah analisa selesai.
                </p>
              </div>
            </div>
          </div>
        )}

        {selectedGoalId && selectedGoal ? (
          <div className="space-y-6">
            {/* Goal Details */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedGoal.goal_name}</h2>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <span className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faBullseye} className="w-4 h-4" />
                      Target: {selectedGoal.target_value} {selectedGoal.target_unit}
                    </span>
                    <span className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faCalendar} className="w-4 h-4" />
                      {new Date(selectedGoal.start_date).toLocaleDateString()} - {new Date(selectedGoal.end_date).toLocaleDateString()}
                    </span>
                    {selectedGoal.business_units && (
                      <span className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faBuilding} className="w-4 h-4" />
                        {selectedGoal.business_units.name}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedGoal.status)}`}>
                    <FontAwesomeIcon icon={getStatusIcon(selectedGoal.status)} className="w-3 h-3 mr-1" />
                    {selectedGoal.status}
                  </span>
                  <button
                    onClick={() => setSelectedGoalId(null)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    Back to List
                  </button>
                </div>
              </div>
            </div>

            {/* Breakdown Approval (Step 3) */}
            {selectedGoal.status === 'Awaiting Breakdown Approval' && (
              <BreakdownApproval goalId={selectedGoalId} />
            )}

            {/* KPI Approval (Step 5) */}
            {selectedGoal.status === 'Awaiting KPI Approval' && (
              <KPIApproval goalId={selectedGoalId} />
            )}

            {/* Active Status */}
            {selectedGoal.status === 'Active' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center gap-3">
                  <FontAwesomeIcon icon={faCheckCircle} className="w-6 h-6 text-green-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-green-900">Goal is Active!</h3>
                    <p className="text-green-700">Daily tasks have been generated for assigned employees.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Goals List */
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">All Strategic Goals</h2>
            </div>
            
            {goals.length === 0 ? (
              <div className="p-8 text-center text-gray-600">
                <p>No goals created yet.</p>
                <button
                  onClick={() => router.push('/dashboard/goals/create')}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Create Your First Goal
                </button>
              </div>
            ) : (              <div className="divide-y divide-gray-200">
                {goals.map((goal) => {
                  const batchStatus = getBatchStatusInfo(goal.analysis_batches?.status);
                  const batchAction = getBatchAction(goal);
                  
                  return (
                    <div
                      key={goal.goal_id}
                      className="p-6 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div 
                          className="flex-1 cursor-pointer"
                          onClick={() => handleGoalClick(goal)}
                        >
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {goal.goal_name}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                            <span className="flex items-center gap-2">
                              <FontAwesomeIcon icon={faBullseye} className="w-4 h-4" />
                              {goal.target_value} {goal.target_unit}
                            </span>
                            <span className="flex items-center gap-2">
                              <FontAwesomeIcon icon={faCalendar} className="w-4 h-4" />
                              {new Date(goal.start_date).toLocaleDateString('id-ID', { 
                                day: '2-digit', 
                                month: 'short', 
                                year: 'numeric' 
                              })}
                              {' - '}
                              {new Date(goal.end_date).toLocaleDateString('id-ID', { 
                                day: '2-digit', 
                                month: 'short', 
                                year: 'numeric' 
                              })}
                            </span>
                            {goal.business_units && (
                              <span className="flex items-center gap-2">
                                <FontAwesomeIcon icon={faBuilding} className="w-4 h-4" />
                                {goal.business_units.name}
                              </span>
                            )}
                          </div>

                          {/* Batch Status Indicator */}
                          {goal.analysis_batches && (
                            <div className="flex items-center gap-2 mt-2">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${batchStatus.color}`}>
                                <span>{batchStatus.icon}</span>
                                <span>{batchStatus.label}</span>
                              </span>
                              <span className="text-xs text-gray-500">
                                {batchStatus.description}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                          {batchAction && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(batchAction.url);
                              }}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${batchAction.color}`}
                            >
                              {batchAction.label}
                            </button>
                          )}
                          <span className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${getStatusColor(goal.status)}`}>
                            {goal.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
