'use client';

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes, faEdit, faSpinner } from '@fortawesome/free-solid-svg-icons';

interface Breakdown {
  breakdown_id: string;
  goal_id: string;
  name: string;
  value: string;
  status: string;
  created_at: string;
}

interface BreakdownApprovalProps {
  goalId: string;
}

export default function BreakdownApproval({ goalId }: BreakdownApprovalProps) {
  const [breakdowns, setBreakdowns] = useState<Breakdown[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ [key: string]: { name: string; value: string } }>({});

  useEffect(() => {
    fetchBreakdowns();
  }, [goalId]);

  const fetchBreakdowns = async () => {
    try {
      const response = await fetch(`/api/breakdowns?goal_id=${goalId}&status=pending_approval`);
      const data = await response.json();
      setBreakdowns(data);
    } catch (error) {
      console.error('Error fetching breakdowns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (breakdown: Breakdown) => {
    setEditingId(breakdown.breakdown_id);
    setEditValues({
      ...editValues,
      [breakdown.breakdown_id]: {
        name: breakdown.name,
        value: breakdown.value,
      },
    });
  };

  const handleSaveEdit = async (breakdownId: string) => {
    try {
      const editData = editValues[breakdownId];
      await fetch(`/api/breakdowns/${breakdownId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editData.name,
          value: editData.value,
        }),
      });
      setEditingId(null);
      fetchBreakdowns();
    } catch (error) {
      console.error('Error updating breakdown:', error);
    }
  };

  const handleApprove = async (breakdownId: string) => {
    try {
      await fetch(`/api/breakdowns/${breakdownId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' }),
      });
      fetchBreakdowns();
    } catch (error) {
      console.error('Error approving breakdown:', error);
    }
  };

  const handleReject = async (breakdownId: string) => {
    try {
      await fetch(`/api/breakdowns/${breakdownId}`, {
        method: 'DELETE',
      });
      fetchBreakdowns();
    } catch (error) {
      console.error('Error rejecting breakdown:', error);
    }
  };

  const handleApproveAll = async () => {
    try {
      await Promise.all(
        breakdowns.map((breakdown) =>
          fetch(`/api/breakdowns/${breakdown.breakdown_id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'approved' }),
          })
        )
      );
      fetchBreakdowns();
      alert('All breakdowns approved! AI will now generate KPIs.');
    } catch (error) {
      console.error('Error approving all breakdowns:', error);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-center">
          <FontAwesomeIcon icon={faSpinner} className="w-6 h-6 text-blue-600 animate-spin" />
          <span className="ml-3 text-gray-600">Loading breakdowns...</span>
        </div>
      </div>
    );
  }

  if (breakdowns.length === 0) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
        <p className="text-gray-600 text-center">No pending breakdowns to review.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900">
          Review AI Strategy Breakdowns
        </h3>
        <button
          onClick={handleApproveAll}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
        >
          <FontAwesomeIcon icon={faCheck} className="w-4 h-4" />
          Approve All
        </button>
      </div>

      <div className="space-y-4">
        {breakdowns.map((breakdown) => (
          <div
            key={breakdown.breakdown_id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            {editingId === breakdown.breakdown_id ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Breakdown Name
                  </label>
                  <input
                    type="text"
                    value={editValues[breakdown.breakdown_id]?.name || ''}
                    onChange={(e) =>
                      setEditValues({
                        ...editValues,
                        [breakdown.breakdown_id]: {
                          ...editValues[breakdown.breakdown_id],
                          name: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Value (%)
                  </label>
                  <input
                    type="number"
                    value={editValues[breakdown.breakdown_id]?.value || ''}
                    onChange={(e) =>
                      setEditValues({
                        ...editValues,
                        [breakdown.breakdown_id]: {
                          ...editValues[breakdown.breakdown_id],
                          value: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSaveEdit(breakdown.breakdown_id)}
                    className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-3 py-1 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900">{breakdown.name}</h4>
                  <p className="text-sm text-gray-600">Value: {breakdown.value}%</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(breakdown)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                    title="Edit"
                  >
                    <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleApprove(breakdown.breakdown_id)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-md"
                    title="Approve"
                  >
                    <FontAwesomeIcon icon={faCheck} className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleReject(breakdown.breakdown_id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                    title="Reject"
                  >
                    <FontAwesomeIcon icon={faTimes} className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Once you approve all breakdowns, the AI will automatically
          generate detailed KPIs based on these recommendations.
        </p>
      </div>
    </div>
  );
}
