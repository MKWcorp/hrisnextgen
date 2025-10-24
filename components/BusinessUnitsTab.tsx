'use client';

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuilding, faPlus, faPencil, faTrash } from '@fortawesome/free-solid-svg-icons';

interface BusinessUnit {
  bu_id: string;
  name: string;
  bu_code?: string;
  description?: string;
}

export default function BusinessUnitsTab() {
  const [businessUnits, setBusinessUnits] = useState<BusinessUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ bu_name: '', bu_code: '', description: '' });

  useEffect(() => {
    fetchBusinessUnits();
  }, []);

  const fetchBusinessUnits = async () => {
    try {
      const response = await fetch('/api/business-units');
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setBusinessUnits(data);
      } else {
        console.error('Business units data is not an array:', data);
        setBusinessUnits([]);
      }
    } catch (error) {
      console.error('Error fetching business units:', error);
      setBusinessUnits([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.bu_name.trim()) {
      alert('Nama unit bisnis tidak boleh kosong');
      return;
    }

    // TODO: Implement POST/create endpoint for business units
    alert('Fitur create business unit akan diimplementasikan');
    setShowForm(false);
    setFormData({ bu_name: '', bu_code: '', description: '' });
  };

  if (loading) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-2">
          <FontAwesomeIcon icon={faBuilding} className="w-6 h-6 text-indigo-600" />
          Business Units
        </h2>
        <p className="text-gray-600">Kelola unit bisnis organisasi Anda</p>
      </div>

      {/* Add Button */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
        Tambah Unit Bisnis
      </button>

      {/* Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tambah Unit Bisnis Baru</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nama Unit Bisnis</label>
              <input
                type="text"
                placeholder="e.g., Marketing Division"
                value={formData.bu_name}
                onChange={(e) => setFormData({ ...formData, bu_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kode Unit (Opsional)</label>
              <input
                type="text"
                placeholder="e.g., MKT-001"
                value={formData.bu_code}
                onChange={(e) => setFormData({ ...formData, bu_code: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi (Opsional)</label>
              <textarea
                placeholder="Deskripsi unit bisnis..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              ></textarea>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Simpan
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Business Units List */}
      {businessUnits.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-yellow-800">Belum ada unit bisnis. Silakan tambahkan unit bisnis baru.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {businessUnits.map((bu) => (
            <div key={bu.bu_id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{bu.name}</h3>
                    {bu.bu_code && (
                      <span className="px-2 py-1 text-xs font-medium text-white bg-blue-600 rounded">
                        {bu.bu_code}
                      </span>
                    )}
                  </div>
                  {bu.description && (
                    <p className="text-gray-600 text-sm">{bu.description}</p>
                  )}
                  <div className="mt-3 text-xs text-gray-500">
                    ID: {bu.bu_id}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    title="Edit"
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    onClick={() => alert('Fitur edit belum diimplementasikan')}
                  >
                    <FontAwesomeIcon icon={faPencil} className="w-4 h-4" />
                  </button>
                  <button
                    title="Delete"
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    onClick={() => alert('Fitur delete belum diimplementasikan')}
                  >
                    <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
