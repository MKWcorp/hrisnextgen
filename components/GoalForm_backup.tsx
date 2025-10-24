'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar, faBullseye, faPlus, faTimes, faMobileAlt, faRocket, faLightbulb, faCheck } from '@fortawesome/free-solid-svg-icons';
import { AlokasiPlatform, AlokasiSumber } from '@/types';
import { formatNumber, parseFormattedNumber } from '@/lib/utils';

interface Goal {
  id: string;
  goal_name: string;
  target_value: string;
}

export default function GoalForm() {
  const [goals, setGoals] = useState<Goal[]>([
    { id: '1', goal_name: 'Impressions', target_value: '' },
  ]);
  
  const [dateRange, setDateRange] = useState({
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
  });

  const [platforms, setPlatforms] = useState<AlokasiPlatform[]>([]);
  const [sources, setSources] = useState<AlokasiSumber[]>([]);
  const [platformInput, setPlatformInput] = useState({ platform: '', percentage: '' });
  const [sourceInput, setSourceInput] = useState({ source: '', percentage: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add new goal row
  const addGoalRow = () => {
    const newId = (goals.length + 1).toString();
    setGoals([...goals, { id: newId, goal_name: '', target_value: '' }]);
  };

  // Remove goal row
  const removeGoalRow = (id: string) => {
    if (goals.length > 1) {
      setGoals(goals.filter(goal => goal.id !== id));
    }
  };

  // Update goal field
  const updateGoal = (id: string, field: 'goal_name' | 'target_value', value: string) => {
    if (field === 'target_value') {
      // Remove non-numeric characters except dots
      const cleanValue = value.replace(/[^\d]/g, '');
      const formattedValue = formatNumber(cleanValue);
      setGoals(goals.map(goal => 
        goal.id === id ? { ...goal, [field]: formattedValue } : goal
      ));
    } else {
      setGoals(goals.map(goal => 
        goal.id === id ? { ...goal, [field]: value } : goal
      ));
    }
  };

  // Platform management
  const addPlatform = () => {
    if (platformInput.platform && platformInput.percentage) {
      setPlatforms([...platforms, { 
        platform: platformInput.platform, 
        percentage: Number(platformInput.percentage) 
      }]);
      setPlatformInput({ platform: '', percentage: '' });
    }
  };

  const removePlatform = (index: number) => {
    setPlatforms(platforms.filter((_, i) => i !== index));
  };

  // Source management
  const addSource = () => {
    if (sourceInput.source && sourceInput.percentage) {
      setSources([...sources, { 
        source: sourceInput.source, 
        percentage: Number(sourceInput.percentage) 
      }]);
      setSourceInput({ source: '', percentage: '' });
    }
  };

  const removeSource = (index: number) => {
    setSources(sources.filter((_, i) => i !== index));
  };

  // Submit all goals
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate goals
      const validGoals = goals.filter(g => g.goal_name.trim() && g.target_value.trim());
      if (validGoals.length === 0) {
        alert('Minimal harus ada 1 goal yang diisi!');
        setIsSubmitting(false);
        return;
      }

      // Submit each goal
      const results = [];
      for (const goal of validGoals) {
        const response = await fetch('/api/goals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            goal_name: goal.goal_name,
            target_value: parseFormattedNumber(goal.target_value),
            start_date: dateRange.start_date,
            end_date: dateRange.end_date,
            alokasi_platform: platforms,
            alokasi_sumber: sources,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          results.push({ success: true, goal: goal.goal_name, id: data.goal_id });
        } else {
          results.push({ success: false, goal: goal.goal_name });
        }
      }

      // Show results
      const successCount = results.filter(r => r.success).length;
      const failCount = results.length - successCount;
      
      if (failCount === 0) {
        alert(`✅ Berhasil membuat ${successCount} goal!\n\nWorkflow AI akan segera memproses KPI.`);
        
        // Show created goal IDs
        console.log('Created Goals:', results.filter(r => r.success));
        
        // Reset form
        setGoals([{ id: '1', goal_name: 'Impressions', target_value: '' }]);
        setPlatforms([]);
        setSources([]);
      } else {
        alert(`⚠️ ${successCount} goal berhasil, ${failCount} gagal.\nSilakan cek console untuk detail.`);
        console.error('Failed goals:', results.filter(r => !r.success));
      }

    } catch (error) {
      console.error('Error:', error);
      alert('❌ Terjadi kesalahan saat membuat goal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalPlatformPercentage = platforms.reduce((sum, p) => sum + p.percentage, 0);
  const totalSourcePercentage = sources.reduce((sum, s) => sum + s.percentage, 0);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Date Range */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FontAwesomeIcon icon={faCalendar} className="w-5 h-5 text-blue-600" />
          Periode Target
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Mulai</label>
            <input
              type="date"
              required
              value={dateRange.start_date}
              onChange={(e) => setDateRange({ ...dateRange, start_date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Selesai</label>
            <input
              type="date"
              required
              value={dateRange.end_date}
              onChange={(e) => setDateRange({ ...dateRange, end_date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Goals Table */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">🎯 Target Goals</h3>
          <button
            type="button"
            onClick={addGoalRow}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
          >
            + Tambah Goal
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-3 text-sm font-semibold text-gray-700">Nama Goal</th>
                <th className="text-left py-3 px-3 text-sm font-semibold text-gray-700">Target Value</th>
                <th className="w-20 py-3 px-3"></th>
              </tr>
            </thead>
            <tbody>
              {goals.map((goal, index) => (
                <tr key={goal.id} className="border-b border-gray-100">
                  <td className="py-3 px-3">
                    <input
                      type="text"
                      placeholder="e.g., Impressions, Followers, Leads"
                      value={goal.goal_name}
                      onChange={(e) => updateGoal(goal.id, 'goal_name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>
                  <td className="py-3 px-3">
                    <input
                      type="text"
                      placeholder="e.g., 360.000.000"
                      value={goal.target_value}
                      onChange={(e) => updateGoal(goal.id, 'target_value', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>
                  <td className="py-3 px-3 text-center">
                    {goals.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeGoalRow(goal.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                        title="Hapus goal"
                      >
                        ✕
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-3 text-xs text-gray-500">
          💡 <strong>Contoh:</strong> Impressions: 360.000.000, Followers: 100.000, Leads: 3.000
        </div>
      </div>

      {/* Platform Allocation */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📱 Alokasi Platform</h3>
        
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            placeholder="Platform (e.g., IG @drw_official)"
            value={platformInput.platform}
            onChange={(e) => setPlatformInput({ ...platformInput, platform: e.target.value })}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="number"
            placeholder="%"
            min="0"
            max="100"
            value={platformInput.percentage}
            onChange={(e) => setPlatformInput({ ...platformInput, percentage: e.target.value })}
            className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="button"
            onClick={addPlatform}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
          >
            +
          </button>
        </div>

        {platforms.length > 0 && (
          <div className="space-y-2 mb-3">
            {platforms.map((item, index) => (
              <div key={index} className="flex justify-between items-center bg-blue-50 px-3 py-2 rounded border border-blue-200">
                <span className="text-sm text-gray-900">{item.platform}: <strong>{item.percentage}%</strong></span>
                <button
                  type="button"
                  onClick={() => removePlatform(index)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <div className={`text-sm font-medium ${totalPlatformPercentage === 100 ? 'text-green-600' : totalPlatformPercentage > 100 ? 'text-red-600' : 'text-gray-600'}`}>
          Total: {totalPlatformPercentage}% {totalPlatformPercentage === 100 ? '✓' : totalPlatformPercentage > 100 ? '(Lebih dari 100%)' : ''}
        </div>
      </div>

      {/* Source Allocation */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🚀 Alokasi Sumber Trafik</h3>
        
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            placeholder="Sumber (e.g., Organik, Paid Ads)"
            value={sourceInput.source}
            onChange={(e) => setSourceInput({ ...sourceInput, source: e.target.value })}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="number"
            placeholder="%"
            min="0"
            max="100"
            value={sourceInput.percentage}
            onChange={(e) => setSourceInput({ ...sourceInput, percentage: e.target.value })}
            className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="button"
            onClick={addSource}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
          >
            +
          </button>
        </div>

        {sources.length > 0 && (
          <div className="space-y-2 mb-3">
            {sources.map((item, index) => (
              <div key={index} className="flex justify-between items-center bg-green-50 px-3 py-2 rounded border border-green-200">
                <span className="text-sm text-gray-900">{item.source}: <strong>{item.percentage}%</strong></span>
                <button
                  type="button"
                  onClick={() => removeSource(index)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <div className={`text-sm font-medium ${totalSourcePercentage === 100 ? 'text-green-600' : totalSourcePercentage > 100 ? 'text-red-600' : 'text-gray-600'}`}>
          Total: {totalSourcePercentage}% {totalSourcePercentage === 100 ? '✓' : totalSourcePercentage > 100 ? '(Lebih dari 100%)' : ''}
        </div>
      </div>

      {/* Submit Button */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border border-green-200">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-md"
        >
          {isSubmitting ? '🔄 Membuat Goals...' : '🚀 Buat Goals & Trigger AI Workflow'}
        </button>
        <p className="text-xs text-gray-600 text-center mt-3">
          AI akan otomatis mem-breakdown goals menjadi KPI actionable
        </p>
      </div>
    </form>
  );
}
