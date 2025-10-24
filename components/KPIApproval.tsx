'use client';

import { useState, useEffect } from 'react';
import { formatNumber } from '@/lib/utils';

interface User {
 user_id: string;
 name: string;
 email: string;
}

interface Role {
 role_id: number;
 role_name: string;
}

interface KPI {
 kpi_id: string;
 kpi_description: string;
 target_bulanan: string;
 platform: string;
 source: string;
 is_approved: boolean;
 assigned_user_id: string | null;
 roles: Role | null;
 users: User | null;
}

export default function KPIApproval({ goalId }: { goalId: string }) {
 const [kpis, setKpis] = useState<KPI[]>([]);
 const [users, setUsers] = useState<User[]>([]);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 fetchKPIs();
 fetchUsers();
 }, [goalId]);

 const fetchKPIs = async () => {
 try {
 const response = await fetch(`/api/kpis?goal_id=${goalId}&is_approved=false`);
 const data = await response.json();
 setKpis(data);
 } catch (error) {
 console.error('Error fetching KPIs:', error);
 } finally {
 setLoading(false);
 }
 };

 const fetchUsers = async () => {
 try {
 const response = await fetch('/api/users');
 const data = await response.json();
 setUsers(data);
 } catch (error) {
 console.error('Error fetching users:', error);
 }
 };

 const handleAssignUser = async (kpiId: string, userId: string) => {
 try {
 await fetch(`/api/kpis/${kpiId}`, {
 method: 'PATCH',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 assigned_user_id: userId,
 is_approved: false,
 }),
 });
 fetchKPIs();
 } catch (error) {
 console.error('Error assigning user:', error);
 }
 };

 const handleApprove = async (kpiId: string, userId: string) => {
 if (!userId) {
 alert('Silakan pilih karyawan terlebih dahulu!');
 return;
 }

 try {
 const response = await fetch(`/api/kpis/${kpiId}`, {
 method: 'PATCH',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 assigned_user_id: userId,
 is_approved: true,
 }),
 });

 if (response.ok) {
 alert('KPI disetujui! n8n akan segera generate daily tasks.');
 fetchKPIs();
 }
 } catch (error) {
 console.error('Error approving KPI:', error);
 }
 };

 if (loading) {
 return <div className="text-center py-8">Loading KPIs...</div>;
 }

 if (kpis.length === 0) {
 return (
 <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
 <p className="text-yellow-800">Tidak ada KPI yang menunggu approval untuk goal ini.</p>
 </div>
 );
 }

 return (
 <div className="space-y-4">
 <h2 className="text-2xl font-bold text-gray-900">Review & Approve KPI</h2>
 
 {kpis.map((kpi) => (
 <div key={kpi.kpi_id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
 <div className="space-y-3">
 <div>
 <span className="text-sm font-medium text-gray-500">Deskripsi KPI:</span>
 <p className="text-gray-900">{kpi.kpi_description}</p>
 </div>
 
 <div className="grid grid-cols-3 gap-4 text-sm">
 <div>
 <span className="font-medium text-gray-500">Target Bulanan:</span>
 <p className="text-gray-900">{formatNumber(kpi.target_bulanan)}</p>
 </div>
 <div>
 <span className="font-medium text-gray-500">Platform:</span>
 <p className="text-gray-900">{kpi.platform || 'N/A'}</p>
 </div>
 <div>
 <span className="font-medium text-gray-500">Sumber:</span>
 <p className="text-gray-900">{kpi.source || 'N/A'}</p>
 </div>
 </div>

 <div>
 <span className="text-sm font-medium text-gray-500">Role yang Disarankan:</span>
 <p className="text-gray-900">{kpi.roles?.role_name || 'Tidak ada rekomendasi'}</p>
 </div>

 <div className="flex gap-4 items-center pt-4 border-t">
 <div className="flex-1">
 <label className="block text-sm font-medium text-gray-700 mb-1">
 Assign ke Karyawan:
 </label>
 <select
 value={kpi.assigned_user_id || ''}
 onChange={(e) => handleAssignUser(kpi.kpi_id, e.target.value)}
 className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
 >
 <option value="">Pilih Karyawan</option>
 {users.map((user) => (
 <option key={user.user_id} value={user.user_id}>
 {user.name} ({user.email})
 </option>
 ))}
 </select>
 </div>

 <button
 onClick={() => handleApprove(kpi.kpi_id, kpi.assigned_user_id || '')}
 disabled={!kpi.assigned_user_id}
 className="px-6 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
 >
 Approve & Trigger Workflow
 </button>
 </div>
 </div>
 </div>
 ))}
 </div>
 );
}
