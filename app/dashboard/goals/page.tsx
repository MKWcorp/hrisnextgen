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
  business_units?: {
    name: string;
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

  useEffect(() => {
    fetchGoals();
  }, []);

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

    try {
      const response = await fetch('/api/goals/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (response.ok) {
        if (data.dev_mode) {
          setAnalysisResult(`✅ ${data.message}\n\n📊 Payload ready untuk ${data.goals_analyzed} goals. Setup n8n webhook untuk enable AI analysis.`);
        } else {
          setAnalysisResult(`✅ ${data.message}`);
        }
        
        // Auto-hide success message after 8 seconds
        setTimeout(() => {
          setAnalysisResult(null);
        }, 8000);
      } else {
        // Show detailed error with help
        const errorMsg = data.message || data.error || 'Failed to trigger analysis';
        const helpMsg = data.help ? `\n\n💡 ${data.help}` : '';
        setAnalysisResult(`❌ ${errorMsg}${helpMsg}`);
        
        // Don't auto-hide error messages
      }
    } catch (error) {
      console.error('Error analyzing goals:', error);
      setAnalysisResult('Error: Failed to connect to analysis service');
    } finally {
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
                      Menganalisa...
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
            ) : (
              <div className="divide-y divide-gray-200">
                {goals.map((goal) => (
                  <div
                    key={goal.goal_id}
                    onClick={() => handleGoalClick(goal)}
                    className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {goal.goal_name}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
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
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${getStatusColor(goal.status)}`}>
                        {goal.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
