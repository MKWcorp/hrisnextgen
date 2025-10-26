'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface TeamRole {
  role_recommendation_id?: string;
  role_name: string;
  responsibilities: string;
  created_at?: string;
}

interface Breakdown {
  breakdown_id?: string;
  name: string;
  value: number;
  unit: string; // Unit field (e.g. "IDR", "pcs", "users")
  status?: string; // Status field (e.g. "pending_approval")
  description?: string;
}

interface Asset {
  asset_id?: string;
  asset_category: string;
  asset_name: string;
  asset_identifier?: string;
  metric_name?: string;
  metric_value?: number;
  created_at?: string;
}

export default function ReviewDetailPage() {
  const params = useParams();
  const router = useRouter();
  const batch_id = params.batch_id as string;
  const [teamRoles, setTeamRoles] = useState<TeamRole[]>([]);
  const [breakdowns, setBreakdowns] = useState<Breakdown[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [activeTab, setActiveTab] = useState<'tim' | 'breakdown' | 'aset'>('tim');
    // New state for polling after submit
  const [isProcessing, setIsProcessing] = useState(false);
  const [pollingIntervalId, setPollingIntervalId] = useState<number | null>(null);
  const [savingStep, setSavingStep] = useState<string>(''); // Track which step is being saved
  useEffect(() => {
    if (!batch_id) return;

    fetchBatchData();
  }, [batch_id]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, []);

  const fetchBatchData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/review/${batch_id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch batch data');
      }

      const data = await response.json();
      
      // Set team roles (now editable)
      setTeamRoles(data.ai_recommended_roles || []);
      
      // Set breakdowns (editable) - convert value from string to number
      const breakdownsData = (data.proposed_breakdowns || []).map((b: any) => ({
        ...b,
        value: typeof b.value === 'string' ? Number(b.value) : b.value,
      }));
      setBreakdowns(breakdownsData);

      // Set assets (editable) - convert metric_value from string to number
      const assetsData = (data.batch_managed_assets || []).map((a: any) => ({
        ...a,
        metric_value: a.metric_value && typeof a.metric_value === 'string' ? Number(a.metric_value) : a.metric_value,
      }));
      setAssets(assetsData);
    } catch (error) {
      console.error('Error fetching batch data:', error);
      alert('Gagal memuat data. Silakan refresh halaman.');
    } finally {
      setIsLoading(false);
    }
  };

  // Team Roles Handlers
  const handleRoleInputChange = (index: number, fieldName: string, value: string) => {
    const updatedRoles = [...teamRoles];
    updatedRoles[index] = {
      ...updatedRoles[index],
      [fieldName]: value,
    };
    setTeamRoles(updatedRoles);
  };

  const handleAddRole = () => {
    setTeamRoles([
      ...teamRoles,
      {
        role_name: '',
        responsibilities: '',
      },
    ]);
  };

  const handleDeleteRole = (index: number) => {
    const updatedRoles = teamRoles.filter((_, i) => i !== index);
    setTeamRoles(updatedRoles);
  };

  // Breakdown Handlers
  const handleInputChange = (index: number, fieldName: string, value: string | number) => {
    const updatedBreakdowns = [...breakdowns];
    updatedBreakdowns[index] = {
      ...updatedBreakdowns[index],
      [fieldName]: value,
    };
    setBreakdowns(updatedBreakdowns);
  };

  const handleAddRow = () => {
    setBreakdowns([
      ...breakdowns,
      {
        name: '',
        value: 0,
        unit: '',
        description: '',
      },
    ]);
  };

  const handleDelete = (index: number) => {
    const updatedBreakdowns = breakdowns.filter((_, i) => i !== index);
    setBreakdowns(updatedBreakdowns);
  };

  // Asset Handlers
  const handleAssetInputChange = (index: number, fieldName: string, value: string | number) => {
    const updatedAssets = [...assets];
    updatedAssets[index] = {
      ...updatedAssets[index],
      [fieldName]: value,
    };
    setAssets(updatedAssets);
  };

  const handleAddAsset = () => {
    setAssets([
      ...assets,
      {
        asset_category: '',
        asset_name: '',
        asset_identifier: '',
        metric_name: '',
        metric_value: 0,
      },
    ]);
  };

  const handleDeleteAsset = (index: number) => {
    const updatedAssets = assets.filter((_, i) => i !== index);
    setAssets(updatedAssets);
  };

  const handleAIRecommendation = async () => {
    // Check if data has been saved first
    if (teamRoles.length === 0 || breakdowns.length === 0) {
      alert('Silakan simpan data terlebih dahulu sebelum generate rekomendasi AI!');
      return;
    }

    if (!confirm('Apakah Anda yakin ingin generate rekomendasi AI? Pastikan Anda sudah menyimpan data terlebih dahulu. Data yang ada akan di-refresh.')) {
      return;
    }

    try {
      setIsGeneratingAI(true);

      // Trigger n8n Workflow #2 (KPI Breakdown) webhook - send only batch_id
      const n8nWebhookUrl = process.env.NEXT_PUBLIC_N8N_WORKFLOW_2_WEBHOOK_URL || 'https://n8n.drwapp.com/webhook/hrisnextgen-kpi-breakdown';
      
      const triggerResponse = await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(batch_id), // Send only batch_id as string
      });

      if (!triggerResponse.ok) {
        throw new Error('Failed to trigger AI workflow');
      }

      alert('AI sedang memproses rekomendasi. Halaman akan otomatis refresh setiap 5 detik.');

      // Start polling for updates
      const pollInterval = setInterval(async () => {
        try {
          const response = await fetch(`/api/review/${batch_id}`);
          if (response.ok) {
            const data = await response.json();
            
            // Check if AI has generated new data
            if (data.ai_recommended_roles && data.ai_recommended_roles.length > 0) {
              // Update state with new data
              setTeamRoles(data.ai_recommended_roles || []);
              
              const breakdownsData = (data.proposed_breakdowns || []).map((b: any) => ({
                ...b,
                value: typeof b.value === 'string' ? Number(b.value) : b.value,
              }));
              setBreakdowns(breakdownsData);

              const assetsData = (data.batch_managed_assets || []).map((a: any) => ({
                ...a,
                metric_value: a.metric_value && typeof a.metric_value === 'string' ? Number(a.metric_value) : a.metric_value,
              }));
              setAssets(assetsData);

              // Stop polling
              clearInterval(pollInterval);
              setIsGeneratingAI(false);
              alert('Rekomendasi AI berhasil di-generate!');
            }
          }
        } catch (error) {
          console.error('Polling error:', error);
        }
      }, 5000); // Poll every 5 seconds

      // Stop polling after 2 minutes
      setTimeout(() => {
        clearInterval(pollInterval);
        setIsGeneratingAI(false);
        alert('Timeout: Silakan refresh halaman secara manual jika data belum muncul.');
      }, 120000);

    } catch (error) {
      console.error('Error triggering AI:', error);
      alert('Gagal trigger AI recommendation. Silakan coba lagi.');
      setIsGeneratingAI(false);
    }
  };

  // Polling functions for checking status after approval
  const stopPolling = () => {
    if (pollingIntervalId) {
      clearInterval(pollingIntervalId);
      setPollingIntervalId(null);
    }
  };

  const checkStatus = async (batchId: string) => {
    try {
      const response = await fetch(`/api/check-status/${batchId}`);
      
      if (!response.ok) {
        throw new Error('Failed to check status');
      }

      const data = await response.json();
      
      if (data.status === 'KPI_Assignment_Pending') {
        stopPolling();
        setIsProcessing(false);
        alert('Rincian KPI siap ditugaskan!');
        router.push('/dashboard/assign/' + batchId);
      }
    } catch (error) {
      console.error('Error checking status:', error);
    }
  };

  const startPolling = (batchId: string) => {
    // Check immediately first
    checkStatus(batchId);
    
    // Then poll every 5 seconds
    const intervalId = window.setInterval(() => {
      checkStatus(batchId);
    }, 5000);
    
    setPollingIntervalId(intervalId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (teamRoles.length === 0) {
      alert('Minimal harus ada 1 rekomendasi role!');
      return;
    }

    if (breakdowns.length === 0) {
      alert('Minimal harus ada 1 breakdown target!');
      return;
    }

    // Validate all team roles have required fields
    const hasEmptyRoles = teamRoles.some(r => !r.role_name || !r.responsibilities);
    if (hasEmptyRoles) {
      alert('Semua field Role (Name, Responsibilities) harus diisi!');
      return;
    }

    // Validate all breakdowns have required fields
    const hasEmptyFields = breakdowns.some(b => !b.name || !b.value || !b.unit);
    if (hasEmptyFields) {
      alert('Semua field Breakdown (Name, Value, Unit) harus diisi!');
      return;
    }

    // Validate all assets have required fields
    const hasEmptyAssets = assets.some(a => !a.asset_category || !a.asset_name);
    if (hasEmptyAssets) {
      alert('Semua field Asset (Category, Name) harus diisi!');
      return;
    }    try {
      setIsSaving(true);
      setIsProcessing(true);
      setSavingStep('Menyimpan perubahan ke database...');
      
      const response = await fetch(`/api/review/${batch_id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teamRoles: teamRoles,
          breakdowns: breakdowns,
          assets: assets,
        }),
      });

      if (!response.ok) {
        setIsProcessing(false);
        setSavingStep('');
        throw new Error('Failed to save data');
      }

      const result = await response.json();
      setIsSaving(false);
      setSavingStep('Menunggu AI membuat rincian KPI...');
      
      alert('Perubahan disimpan! Sedang membuat rincian KPI...');
      // Start polling for status
      startPolling(batch_id);
    } catch (error) {
      console.error('Error saving data:', error);
      alert('Gagal menyimpan perubahan. Silakan coba lagi.');
      setIsProcessing(false);
      setIsSaving(false);
      setSavingStep('');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading...</span>
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
          <h1 className="text-3xl font-bold text-gray-900">📝 Review & Edit Rekomendasi AI</h1>
          <p className="text-gray-600 mt-2">
            Review hasil analisa AI, edit breakdown target sesuai kebutuhan
          </p>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-t-lg shadow-sm border border-gray-200 border-b-0">
          <div className="flex">
            <button
              onClick={() => setActiveTab('tim')}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors ${
                activeTab === 'tim'
                  ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50 border-b-2 border-transparent'
              }`}
            >
              <span className="text-xl mr-2">👥</span>
              Rekomendasi Tim
              {teamRoles.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                  {teamRoles.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('breakdown')}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors ${
                activeTab === 'breakdown'
                  ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50 border-b-2 border-transparent'
              }`}
            >
              <span className="text-xl mr-2">🎯</span>
              Target Breakdown
              {breakdowns.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                  {breakdowns.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('aset')}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors ${
                activeTab === 'aset'
                  ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50 border-b-2 border-transparent'
              }`}
            >
              <span className="text-xl mr-2">📦</span>
              Managed Assets
              {assets.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                  {assets.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-b-lg shadow-sm border border-gray-200 p-6">
          {/* Tab: Rekomendasi Tim */}
          {activeTab === 'tim' && (
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Edit rekomendasi role dari AI. Anda bisa menambah, mengedit, atau menghapus role.
              </p>              {/* Action Buttons - Moved to Top */}
              <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleAddRole}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2"
                  >
                    ➕ Tambah Role
                  </button>
                  <button
                    type="button"
                    onClick={handleAIRecommendation}
                    disabled={isGeneratingAI || isProcessing}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    title={isProcessing ? "Tombol ini akan aktif setelah proses KPI selesai" : "Generate ulang rekomendasi AI"}
                  >
                    {isGeneratingAI ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Generating AI...
                      </>
                    ) : (
                      <>🤖 Rekomendasi AI</>                  )}
                  </button>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => router.push('/dashboard/review')}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                    disabled={isProcessing}
                  >
                    Batal
                  </button>
                  
                  {!isProcessing ? (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isSaving || teamRoles.length === 0 || breakdowns.length === 0}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isSaving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Menyimpan...
                        </>
                      ) : (
                        <>💾 Simpan & Setujui</>
                      )}
                    </button>
                  ) : (
                    <div className="px-6 py-2 bg-yellow-100 text-yellow-800 rounded-lg flex items-center gap-2 border border-yellow-300">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-800"></div>
                      <span>Sedang membuat rincian KPI, mohon tunggu...</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4 mb-6">
                {teamRoles.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    Belum ada rekomendasi tim. Klik "Tambah Role" untuk mulai.
                  </div>
                ) : (
                  teamRoles.map((role, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-12 gap-3 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-200"
                    >
                      {/* Role Name */}
                      <div className="col-span-12 sm:col-span-4">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Role Name *
                        </label>
                        <input
                          type="text"
                          value={role.role_name}
                          onChange={(e) => handleRoleInputChange(index, 'role_name', e.target.value)}
                          placeholder="e.g. Marketing Manager"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          required
                        />
                      </div>

                      {/* Delete Button */}
                      <div className="col-span-12 sm:col-span-1 flex items-end sm:order-last">
                        <button
                          type="button"
                          onClick={() => handleDeleteRole(index)}
                          className="w-full px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                          title="Hapus role ini"
                        >
                          🗑️
                        </button>
                      </div>

                      {/* Responsibilities (Full width) */}
                      <div className="col-span-12 sm:col-span-7">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Responsibilities *
                        </label>
                        <textarea
                          value={role.responsibilities}
                          onChange={(e) => handleRoleInputChange(index, 'responsibilities', e.target.value)}
                          placeholder="Describe the role's key responsibilities..."
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                          required
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Tab: Target Breakdown */}
          {activeTab === 'breakdown' && (
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Edit target breakdown di bawah ini sesuai kebutuhan. Anda bisa menambah, mengedit, atau menghapus baris.
              </p>              {/* Action Buttons - Moved to Top */}
              <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleAddRow}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
                  >
                    ➕ Tambah Target
                  </button>
                  <button
                    type="button"
                    onClick={handleAIRecommendation}
                    disabled={isGeneratingAI || isProcessing}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    title={isProcessing ? "Tombol ini akan aktif setelah proses KPI selesai" : "Generate ulang rekomendasi AI"}
                  >
                    {isGeneratingAI ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Generating AI...
                      </>
                    ) : (
                      <>🤖 Rekomendasi AI</>
                    )}
                  </button>
                </div><div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => router.push('/dashboard/review')}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                    disabled={isProcessing}
                  >
                    Batal
                  </button>
                  
                  {!isProcessing ? (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isSaving || teamRoles.length === 0 || breakdowns.length === 0}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isSaving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Menyimpan...
                        </>
                      ) : (
                        <>💾 Simpan & Setujui</>
                      )}
                    </button>
                  ) : (
                    <div className="px-6 py-2 bg-yellow-100 text-yellow-800 rounded-lg flex items-center gap-2 border border-yellow-300">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-800"></div>
                      <span>Sedang membuat rincian KPI, mohon tunggu...</span>
                    </div>
                  )}
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="space-y-4 mb-6">
                  {breakdowns.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      Belum ada breakdown. Klik "Tambah Baris Target" untuk mulai.
                    </div>
                  ) : (
                    breakdowns.map((breakdown, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-12 gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        {/* Name */}
                        <div className="col-span-12 sm:col-span-4">
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Target Name *
                          </label>
                          <input
                            type="text"
                            value={breakdown.name}
                            onChange={(e) => handleInputChange(index, 'name', e.target.value)}
                            placeholder="e.g. Q1 Sales Target"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          />
                        </div>

                        {/* Value */}
                        <div className="col-span-6 sm:col-span-3">
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Value *
                          </label>
                          <input
                            type="number"
                            value={breakdown.value}
                            onChange={(e) => handleInputChange(index, 'value', Number(e.target.value))}
                            placeholder="1000000"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          />
                        </div>

                        {/* Unit */}
                        <div className="col-span-6 sm:col-span-3">
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Unit *
                          </label>
                          <input
                            type="text"
                            value={breakdown.unit}
                            onChange={(e) => handleInputChange(index, 'unit', e.target.value)}
                            placeholder="e.g. IDR, pcs, users"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          />
                        </div>

                        {/* Delete Button (beside unit) */}
                        <div className="col-span-12 sm:col-span-2 flex items-end">
                          <button
                            type="button"
                            onClick={() => handleDelete(index)}
                            className="w-full px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                            title="Hapus baris ini"
                          >
                            🗑️ Hapus
                          </button>
                        </div>

                        {/* Description (Full width) */}
                        <div className="col-span-12">
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Description
                          </label>
                          <textarea
                            value={breakdown.description || ''}
                            onChange={(e) => handleInputChange(index, 'description', e.target.value)}
                            placeholder="Additional notes, context, or details about this target..."
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleAddRow}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    ➕ Tambah Baris Target
                  </button>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => router.push('/dashboard/review')}
                      className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving || teamRoles.length === 0 || breakdowns.length === 0}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {isSaving ? 'Menyimpan...' : '💾 Simpan Semua & Trigger Workflow #2'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* Tab: Managed Assets */}
          {activeTab === 'aset' && (
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Edit managed assets yang terkait dengan strategi ini. Tambah, edit, atau hapus aset.
              </p>              {/* Action Buttons - Moved to Top */}
              <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleAddAsset}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center gap-2"
                  >
                    ➕ Tambah Asset
                  </button>
                  <button
                    type="button"
                    onClick={handleAIRecommendation}
                    disabled={isGeneratingAI || isProcessing}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    title={isProcessing ? "Tombol ini akan aktif setelah proses KPI selesai" : "Generate ulang rekomendasi AI"}
                  >
                    {isGeneratingAI ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Generating AI...
                      </>
                    ) : (
                      <>🤖 Rekomendasi AI</>                  )}
                  </button>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => router.push('/dashboard/review')}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                    disabled={isProcessing}
                  >
                    Batal
                  </button>
                  
                  {!isProcessing ? (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isSaving || teamRoles.length === 0 || breakdowns.length === 0}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isSaving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Menyimpan...
                        </>
                      ) : (
                        <>💾 Simpan & Setujui</>
                      )}
                    </button>
                  ) : (
                    <div className="px-6 py-2 bg-yellow-100 text-yellow-800 rounded-lg flex items-center gap-2 border border-yellow-300">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-800"></div>
                      <span>Sedang membuat rincian KPI, mohon tunggu...</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4 mb-6">
                {assets.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    Belum ada managed assets. Klik "Tambah Asset" untuk mulai.
                  </div>
                ) : (
                  assets.map((asset, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-12 gap-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200"
                    >
                      {/* Asset Category */}
                      <div className="col-span-12 sm:col-span-3">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Category *
                        </label>
                        <input
                          type="text"
                          value={asset.asset_category}
                          onChange={(e) => handleAssetInputChange(index, 'asset_category', e.target.value)}
                          placeholder="e.g. Website, Social Media"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          required
                        />
                      </div>

                      {/* Asset Name */}
                      <div className="col-span-12 sm:col-span-3">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Asset Name *
                        </label>
                        <input
                          type="text"
                          value={asset.asset_name}
                          onChange={(e) => handleAssetInputChange(index, 'asset_name', e.target.value)}
                          placeholder="e.g. Instagram, Website"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          required
                        />
                      </div>

                      {/* Asset Identifier */}
                      <div className="col-span-12 sm:col-span-3">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Identifier
                        </label>
                        <input
                          type="text"
                          value={asset.asset_identifier || ''}
                          onChange={(e) => handleAssetInputChange(index, 'asset_identifier', e.target.value)}
                          placeholder="@username, URL"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>                      {/* Delete Button */}
                      <div className="col-span-12 sm:col-span-1 flex items-end sm:order-last">
                        <button
                          type="button"
                          onClick={() => handleDeleteAsset(index)}
                          className="w-full px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                          title="Hapus asset ini"
                        >
                          🗑️
                        </button>
                      </div>

                      {/* Metric Name */}
                      <div className="col-span-6 sm:col-span-4">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Metric Name
                        </label>
                        <input
                          type="text"
                          value={asset.metric_name || ''}
                          onChange={(e) => handleAssetInputChange(index, 'metric_name', e.target.value)}
                          placeholder="e.g. Total Followers, Monthly Visitors"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>

                      {/* Metric Value */}
                      <div className="col-span-6 sm:col-span-4">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Metric Value
                        </label>
                        <input
                          type="number"
                          value={asset.metric_value || ''}
                          onChange={(e) => handleAssetInputChange(index, 'metric_value', e.target.value ? Number(e.target.value) : 0)}
                          placeholder="10000"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
