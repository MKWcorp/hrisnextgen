'use client';

import { useState, useEffect } from 'react';

interface User {
 user_id: string;
 name: string;
 email: string;
}

interface StrategicGoal {
 goal_id: string;
 goal_name: string;
}

interface ProposedKpi {
 kpi_id: string;
 kpi_description: string;
 platform: string;
 source: string;
 strategic_goals: StrategicGoal;
}

interface DailyTask {
 task_id: string;
 task_description: string;
 task_date: string;
 is_completed: boolean;
 completed_at: string | null;
 proposed_kpis: ProposedKpi;
}

export default function DailyTasksView({ userId }: { userId: string }) {
 const [tasks, setTasks] = useState<DailyTask[]>([]);
 const [selectedDate, setSelectedDate] = useState<string>('');
 const [loading, setLoading] = useState(true);
 const [updating, setUpdating] = useState<string | null>(null);
 const [mounted, setMounted] = useState(false);

 // Initialize date on client side only
 useEffect(() => {
 setMounted(true);
 setSelectedDate(new Date().toISOString().split('T')[0]);
 }, []);

 useEffect(() => {
 if (selectedDate) {
 fetchTasks();
 }
 }, [userId, selectedDate]);

 const fetchTasks = async () => {
 setLoading(true);
 try {
 const response = await fetch(
 `/api/tasks?user_id=${userId}&task_date=${selectedDate}`
 );
 const data = await response.json();
 setTasks(data);
 } catch (error) {
 console.error('Error fetching tasks:', error);
 } finally {
 setLoading(false);
 }
 };

 const handleToggleComplete = async (taskId: string, currentStatus: boolean) => {
 setUpdating(taskId);
 try {
 await fetch(`/api/tasks/${taskId}`, {
 method: 'PATCH',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 is_completed: !currentStatus,
 }),
 });
 fetchTasks();
 } catch (error) {
 console.error('Error updating task:', error);
 } finally {
 setUpdating(null);
 }
 };

 const completedTasks = tasks.filter((t) => t.is_completed).length;
 const totalTasks = tasks.length;
 const completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

 if (!mounted) {
 return (
 <div className="bg-white p-6 rounded-lg shadow-md">
 <div className="animate-pulse">
 <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
 <div className="space-y-3">
 <div className="h-16 bg-gray-200 rounded"></div>
 <div className="h-16 bg-gray-200 rounded"></div>
 <div className="h-16 bg-gray-200 rounded"></div>
 </div>
 </div>
 </div>
 );
 }

 if (loading) {
 return <div className="text-center py-8">Loading tasks...</div>;
 }

 return (
 <div className="space-y-6">
 <div className="bg-white p-6 rounded-lg shadow-md">
 <div className="flex items-center justify-between mb-4">
 <h2 className="text-2xl font-bold text-gray-900">Daily Tasks</h2>
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">
 Pilih Tanggal:
 </label>
 <input
 type="date"
 value={selectedDate}
 onChange={(e) => setSelectedDate(e.target.value)}
 className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
 />
 </div>
 </div>

 <div className="mb-6">
 <div className="flex items-center justify-between mb-2">
 <span className="text-sm font-medium text-gray-700">
 Progress: {completedTasks} / {totalTasks} tasks
 </span>
 <span className="text-sm font-medium text-gray-700">
 {completionPercentage.toFixed(1)}%
 </span>
 </div>
 <div className="w-full bg-gray-200 rounded-full h-3">
 <div
 className="bg-green-600 h-3 rounded-full transition-all duration-300"
 style={{ width: `${completionPercentage}%` }}
 ></div>
 </div>
 </div>

 {tasks.length === 0 ? (
 <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
 <p className="text-blue-800">
 Tidak ada tugas untuk tanggal {new Date(selectedDate).toLocaleDateString('id-ID')}.
 </p>
 </div>
 ) : (
 <div className="space-y-3">
 {tasks.map((task) => (
 <div
 key={task.task_id}
 className={`border rounded-lg p-4 transition-all ${
 task.is_completed
 ? 'bg-green-50 border-green-200'
 : 'bg-white border-gray-200'
 }`}
 >
 <div className="flex items-start gap-3">
 <input
 type="checkbox"
 checked={task.is_completed}
 onChange={() => handleToggleComplete(task.task_id, task.is_completed)}
 disabled={updating === task.task_id}
 className="mt-1 h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
 />
 <div className="flex-1">
 <p
 className={`text-base ${
 task.is_completed
 ? 'line-through text-gray-500'
 : 'text-gray-900'
 }`}
 >
 {task.task_description}
 </p>
 <div className="mt-2 space-y-1">
 <div className="text-sm text-gray-600">
 <span className="font-medium">KPI:</span>{' '}
 {task.proposed_kpis.kpi_description}
 </div>
 <div className="flex gap-4 text-xs text-gray-500">
 <span>
 <span className="font-medium">Platform:</span>{' '}
 {task.proposed_kpis.platform || 'N/A'}
 </span>
 <span>
 <span className="font-medium">Source:</span>{' '}
 {task.proposed_kpis.source || 'N/A'}
 </span>
 </div>
 <div className="text-xs text-gray-500">
 <span className="font-medium">Goal:</span>{' '}
 {task.proposed_kpis.strategic_goals.goal_name}
 </div>
 {task.is_completed && task.completed_at && (
 <div className="text-xs text-green-600 font-medium">
 Completed at:{' '}
 {new Date(task.completed_at).toLocaleString('id-ID')}
 </div>
 )}
 </div>
 </div>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 </div>
 );
}
