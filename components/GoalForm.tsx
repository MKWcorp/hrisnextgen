'use client';

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar, faBullseye, faPlus, faTimes, faRocket } from '@fortawesome/free-solid-svg-icons';
import { formatNumber, parseFormattedNumber } from '@/lib/utils';

interface Goal {
  id: string;
  goal_name: string;
  target_value: string;
}

interface Role {
  role_id: number;
  role_name: string;
  description?: string;
}

interface BusinessUnit {
  bu_id: string;
  name: string;
  description?: string;
}

export default function GoalForm() {
  const [goals, setGoals] = useState<Goal[]>([
    { id: '1', goal_name: 'Impressions', target_value: '' },
  ]);
  
  const [dateRange, setDateRange] = useState({
    start_date: '',
    end_date: ''
  });

  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<number | ''>('');

  const [businessUnits, setBusinessUnits] = useState<BusinessUnit[]>([]);
  const [selectedBusinessUnitId, setSelectedBusinessUnitId] = useState<string>('');

  // Fetch roles on component mount
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await fetch('/api/roles');
        if (response.ok) {
          const rolesData = await response.json();
          setRoles(rolesData);
        } else {
          console.error('Failed to fetch roles');
        }
      } catch (error) {
        console.error('Error fetching roles:', error);
      }
    };

    fetchRoles();
  }, []);

  // Fetch business units on component mount
  useEffect(() => {
    const fetchBusinessUnits = async () => {
      try {
        const response = await fetch('/api/business-units');
        if (response.ok) {
          const businessUnitsData = await response.json();
          setBusinessUnits(businessUnitsData);
        } else {
          console.error('Failed to fetch business units');
        }
      } catch (error) {
        console.error('Error fetching business units:', error);
      }
    };

    fetchBusinessUnits();
  }, []);

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

  // Submit goals
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (goals.length === 0) {
      alert('Please add at least one goal');
      return;
    }

    try {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          goals,
          dateRange,
          roleId: selectedRoleId,
          businessUnitId: selectedBusinessUnitId,
        }),
      });

      if (response.ok) {
        alert('Goals submitted successfully!');
        setGoals([]);
        setDateRange({ start_date: '', end_date: '' });
        setSelectedRoleId('');
        setSelectedBusinessUnitId('');
      } else {
        alert('Failed to submit goals');
      }
    } catch (error) {
      console.error('Error submitting goals:', error);
      alert('Error submitting goals');
    }
  };

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

      {/* Role Selection */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FontAwesomeIcon icon={faBullseye} className="w-5 h-5 text-blue-600" />
          Pilih Role
        </h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Role yang Ditargetkan</label>
          <select
            value={selectedRoleId}
            onChange={(e) => setSelectedRoleId(e.target.value ? Number(e.target.value) : '')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Pilih Role...</option>
            {roles.map((role) => (
              <option key={role.role_id} value={role.role_id}>
                {role.role_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Business Unit Selection */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FontAwesomeIcon icon={faBullseye} className="w-5 h-5 text-green-600" />
          Pilih Unit Bisnis
        </h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Unit Bisnis yang Ditargetkan</label>
          <select
            value={selectedBusinessUnitId}
            onChange={(e) => setSelectedBusinessUnitId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          >
            <option value="">Pilih Unit Bisnis...</option>
            {businessUnits.map((unit) => (
              <option key={unit.bu_id} value={unit.bu_id}>
                {unit.name}
              </option>
            ))}
          </select>
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

      {/* Submit Button */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border border-green-200">
        <button
          type="submit"
          className="w-full py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-blue-700 transition-all shadow-md"
        >
          🚀 Buat Goals & Trigger AI Workflow
        </button>
        <p className="text-xs text-gray-600 text-center mt-3">
          AI akan otomatis mem-breakdown goals menjadi KPI actionable
        </p>
      </div>
    </form>
  );
}
