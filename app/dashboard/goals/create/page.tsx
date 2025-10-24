'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar, faBullseye, faPlus, faTimes, faRocket, faArrowLeft, faBuilding } from '@fortawesome/free-solid-svg-icons';

interface BusinessUnit {
  bu_id: string;
  name: string;
  bu_code?: string;
}

interface Role {
  role_id: number;
  role_name: string;
  description?: string;
}

interface User {
  user_id: string;
  name: string;
  email: string;
  role_id?: number;
  roles?: {
    role_name: string;
  };
}

interface Goal {
  goal_name: string;
  target_value: string;
  target_unit: string;
}

// Function to format number with Indonesian separator (dots)
const formatNumberWithSeparator = (value: string): string => {
  // Remove all non-digit characters
  const numericValue = value.replace(/\D/g, '');
  
  // Add dots as thousand separators
  return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

// Function to parse formatted number back to numeric value
const parseFormattedNumber = (formattedValue: string): string => {
  return formattedValue.replace(/\./g, '');
};

export default function CreateGoalPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [businessUnits, setBusinessUnits] = useState<BusinessUnit[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  // Form states
  const [businessUnitId, setBusinessUnitId] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [goals, setGoals] = useState<Goal[]>([{ goal_name: '', target_value: '', target_unit: '' }]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Initialize dates and fetch data
  useEffect(() => {
    setMounted(true);
    const today = new Date();
    const nextYear = new Date();
    nextYear.setFullYear(today.getFullYear() + 1);
    
    setStartDate(today.toISOString().split('T')[0]);
    setEndDate(nextYear.toISOString().split('T')[0]);

    fetchBusinessUnits();
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setUsers(data);
        if (data.length > 0) {
          setSelectedUserId(data[0].user_id);
        }
      } else {
        console.error('Users data is not an array:', data);
        setError('Format data user tidak valid');
        setUsers([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Gagal memuat daftar user');
      setUsers([]);
    }
  };

  const fetchBusinessUnits = async () => {
    try {
      const response = await fetch('/api/business-units');
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setBusinessUnits(data);
        if (data.length > 0) {
          setBusinessUnitId(data[0].bu_id);
        }
      } else {
        console.error('Business units data is not an array:', data);
        setError('Format data unit bisnis tidak valid');
        setBusinessUnits([]);
      }
    } catch (error) {
      console.error('Error fetching business units:', error);
      setError('Gagal memuat daftar unit bisnis');
      setBusinessUnits([]);
    }
  };

  const addGoalRow = () => {
    setGoals([...goals, { goal_name: '', target_value: '', target_unit: '' }]);
  };

  const removeGoalRow = (index: number) => {
    if (goals.length > 1) {
      setGoals(goals.filter((_, i) => i !== index));
    }
  };

  const handleGoalChange = (index: number, field: keyof Goal, value: string) => {
    const updatedGoals = [...goals];
    updatedGoals[index][field] = value;
    setGoals(updatedGoals);
  };

  const handleTargetValueChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const formattedValue = formatNumberWithSeparator(inputValue);
    const updatedGoals = [...goals];
    updatedGoals[index].target_value = formattedValue;
    setGoals(updatedGoals);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    setError('');

    try {
      if (!businessUnitId) {
        setError('Unit Bisnis harus dipilih');
        setIsSubmitting(false);
        return;
      }

      if (!selectedUserId) {
        setError('User pembuat harus dipilih');
        setIsSubmitting(false);
        return;
      }

      if (!startDate || !endDate) {
        setError('Tanggal mulai dan selesai harus diisi');
        setIsSubmitting(false);
        return;
      }

      if (new Date(startDate) >= new Date(endDate)) {
        setError('Tanggal mulai harus lebih awal dari tanggal selesai');
        setIsSubmitting(false);
        return;
      }

      // Validate all goals
      const validGoals = goals.filter(goal => 
        goal.goal_name.trim() !== '' && 
        goal.target_value !== '' && 
        goal.target_unit.trim() !== ''
      );

      if (validGoals.length === 0) {
        setError('Minimal tambahkan satu goal dengan nama, target value, dan target unit yang lengkap');
        setIsSubmitting(false);
        return;
      }

      const payload = {
        goals: validGoals.map(goal => ({
          goal_name: goal.goal_name.trim(),
          target_value: parseFormattedNumber(goal.target_value),
          target_unit: goal.target_unit.trim(),
        })),
        dateRange: {
          start_date: startDate,
          end_date: endDate,
        },
        userId: selectedUserId,
        businessUnitId: businessUnitId,
      };

      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(`✓ ${data.goals.length} Goal berhasil dibuat! AI akan segera menganalisis dan membuat rekomendasi breakdown.`);
        
        setGoals([{ goal_name: '', target_value: '', target_unit: '' }]);
        setBusinessUnitId('');
        setSelectedUserId('');
        
        setTimeout(() => {
          router.push('/dashboard/goals');
        }, 2000);
      } else {
        const errData = await response.json();
        setError(errData.error || 'Gagal membuat goal');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Terjadi kesalahan saat membuat goal');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="space-y-3">
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4" />
            Kembali
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Buat Strategic Goal Baru</h1>
          <p className="text-gray-600 mt-2">Tentukan goal, unit target, dan uraikan ke komponen-komponen terukur</p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}
        {message && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 whitespace-pre-line">{message}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Business Unit & User Selection */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FontAwesomeIcon icon={faBuilding} className="w-5 h-5 text-indigo-600" />
              Informasi Dasar
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Unit Bisnis</label>
                {businessUnits.length === 0 ? (
                  <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-500 italic">
                    Tidak ada unit bisnis yang tersedia
                  </div>
                ) : (
                  <select
                    required
                    value={businessUnitId}
                    onChange={(e) => setBusinessUnitId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="">-- Pilih Unit Bisnis --</option>
                    {businessUnits.map((bu) => (
                      <option key={bu.bu_id} value={bu.bu_id}>
                        {bu.bu_code ? `${bu.bu_code} - ${bu.name}` : bu.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FontAwesomeIcon icon={faBuilding} className="w-4 h-4 mr-2 text-gray-500" />
                  Dibuat Oleh (User)
                </label>
                {users.length === 0 ? (
                  <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-500 italic">
                    Tidak ada user yang tersedia
                  </div>
                ) : (
                  <select
                    required
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="">-- Pilih User --</option>
                    {users.map((user) => (
                      <option key={user.user_id} value={user.user_id}>
                        {user.name} {user.roles?.role_name ? `(${user.roles.role_name})` : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>

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
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Selesai</label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Goal Details */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FontAwesomeIcon icon={faBullseye} className="w-5 h-5 text-green-600" />
              Detail Goal
            </h3>
            <p className="text-sm text-gray-600 mb-4">Tambahkan satu atau lebih goal yang ingin dicapai</p>

            <div className="space-y-4">
              {goals.map((goal, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-sm font-medium text-gray-700">Goal {index + 1}</h4>
                    {goals.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeGoalRow(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                        title="Hapus goal"
                      >
                        <FontAwesomeIcon icon={faTimes} className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nama Goal</label>
                      <input
                        type="text"
                        placeholder="e.g., Target Impresi 2025"
                        value={goal.goal_name}
                        onChange={(e) => handleGoalChange(index, 'goal_name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Target Value</label>
                      <input
                        type="text"
                        placeholder="e.g., 360.000.000"
                        value={goal.target_value}
                        onChange={(e) => handleTargetValueChange(index, e)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Target Unit</label>
                      <input
                        type="text"
                        placeholder="e.g., Impressions, Rupiah"
                        value={goal.target_unit}
                        onChange={(e) => handleGoalChange(index, 'target_unit', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addGoalRow}
              className="mt-4 w-full px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 flex items-center justify-center gap-2"
            >
              <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
              Tambah Goal
            </button>
          </div>

          {/* Submit Button */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border border-green-200">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-md flex items-center justify-center gap-2"
            >
              <FontAwesomeIcon icon={faRocket} className="w-5 h-5" />
              {isSubmitting ? 'Membuat Goal...' : 'Buat Strategic Goal'}
            </button>
            <p className="text-xs text-gray-600 text-center mt-3">
              Setelah goal dibuat, AI akan otomatis menganalisis dan membuat rekomendasi breakdown untuk Anda review
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
