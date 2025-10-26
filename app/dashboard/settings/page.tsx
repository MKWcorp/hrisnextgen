'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface BusinessUnit {
  bu_id: string;
  name: string;
  description: string | null;
  created_at: string | null;
}

interface Role {
  role_id: number;
  role_name: string;
  description: string | null;
}

interface User {
  user_id: string;
  name: string;
  email: string;
  role_id: number | null;
  business_unit_id: string | null;
  created_at: string | null;
  roles: Role | null;
  business_units: BusinessUnit | null;
}

type TabType = 'business' | 'roles' | 'users';

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('business');
  
  // Business Units State
  const [businessUnits, setBusinessUnits] = useState<BusinessUnit[]>([]);
  const [isLoadingBU, setIsLoadingBU] = useState(true);
  const [editingBU, setEditingBU] = useState<BusinessUnit | null>(null);
  const [showBUForm, setShowBUForm] = useState(false);
  const [buForm, setBuForm] = useState({ name: '', description: '' });

  // Roles State
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(true);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [roleForm, setRoleForm] = useState({ role_name: '', description: '' });

  // Users State
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showUserForm, setShowUserForm] = useState(false);
  const [userForm, setUserForm] = useState({ 
    name: '', 
    email: '', 
    role_id: '', 
    business_unit_id: '' 
  });

  useEffect(() => {
    fetchBusinessUnits();
    fetchRoles();
    fetchUsers();
  }, []);

  // ========== Business Units Functions ==========
  const fetchBusinessUnits = async () => {
    try {
      setIsLoadingBU(true);
      const response = await fetch('/api/business-units');
      const data = await response.json();
      setBusinessUnits(data);
    } catch (error) {
      console.error('Error fetching business units:', error);
      alert('Gagal memuat business units');
    } finally {
      setIsLoadingBU(false);
    }
  };

  const handleSaveBU = async () => {
    if (!buForm.name.trim()) {
      alert('Nama business unit wajib diisi');
      return;
    }

    try {
      const url = editingBU 
        ? `/api/business-units/${editingBU.bu_id}` 
        : '/api/business-units';
      
      const response = await fetch(url, {
        method: editingBU ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buForm),
      });

      if (response.ok) {
        alert(editingBU ? 'Business unit berhasil diupdate' : 'Business unit berhasil ditambahkan');
        setShowBUForm(false);
        setEditingBU(null);
        setBuForm({ name: '', description: '' });
        fetchBusinessUnits();
      } else {
        alert('Gagal menyimpan business unit');
      }
    } catch (error) {
      console.error('Error saving business unit:', error);
      alert('Terjadi kesalahan');
    }
  };

  const handleEditBU = (bu: BusinessUnit) => {
    setEditingBU(bu);
    setBuForm({ name: bu.name, description: bu.description || '' });
    setShowBUForm(true);
  };

  const handleDeleteBU = async (bu_id: string) => {
    if (!confirm('Yakin ingin menghapus business unit ini?')) return;

    try {
      const response = await fetch(`/api/business-units/${bu_id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Business unit berhasil dihapus');
        fetchBusinessUnits();
      } else {
        alert('Gagal menghapus business unit');
      }
    } catch (error) {
      console.error('Error deleting business unit:', error);
      alert('Terjadi kesalahan');
    }
  };

  // ========== Roles Functions ==========
  const fetchRoles = async () => {
    try {
      setIsLoadingRoles(true);
      const response = await fetch('/api/roles');
      const data = await response.json();
      setRoles(data);
    } catch (error) {
      console.error('Error fetching roles:', error);
      alert('Gagal memuat roles');
    } finally {
      setIsLoadingRoles(false);
    }
  };

  const handleSaveRole = async () => {
    if (!roleForm.role_name.trim()) {
      alert('Nama role wajib diisi');
      return;
    }

    try {
      const url = editingRole 
        ? `/api/roles/${editingRole.role_id}` 
        : '/api/roles';
      
      const response = await fetch(url, {
        method: editingRole ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roleForm),
      });

      if (response.ok) {
        alert(editingRole ? 'Role berhasil diupdate' : 'Role berhasil ditambahkan');
        setShowRoleForm(false);
        setEditingRole(null);
        setRoleForm({ role_name: '', description: '' });
        fetchRoles();
      } else {
        alert('Gagal menyimpan role');
      }
    } catch (error) {
      console.error('Error saving role:', error);
      alert('Terjadi kesalahan');
    }
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setRoleForm({ role_name: role.role_name, description: role.description || '' });
    setShowRoleForm(true);
  };

  const handleDeleteRole = async (role_id: number) => {
    if (!confirm('Yakin ingin menghapus role ini?')) return;

    try {
      const response = await fetch(`/api/roles/${role_id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Role berhasil dihapus');
        fetchRoles();
      } else {
        alert('Gagal menghapus role');
      }
    } catch (error) {
      console.error('Error deleting role:', error);
      alert('Terjadi kesalahan');
    }
  };

  // ========== Users Functions ==========
  const fetchUsers = async () => {
    try {
      setIsLoadingUsers(true);
      const response = await fetch('/api/users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Gagal memuat users');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleSaveUser = async () => {
    if (!userForm.name.trim() || !userForm.email.trim()) {
      alert('Nama dan email wajib diisi');
      return;
    }

    try {
      const url = editingUser 
        ? `/api/users/${editingUser.user_id}` 
        : '/api/users';
      
      const response = await fetch(url, {
        method: editingUser ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...userForm,
          role_id: userForm.role_id ? parseInt(userForm.role_id) : null,
          business_unit_id: userForm.business_unit_id || null,
        }),
      });

      if (response.ok) {
        alert(editingUser ? 'User berhasil diupdate' : 'User berhasil ditambahkan');
        setShowUserForm(false);
        setEditingUser(null);
        setUserForm({ name: '', email: '', role_id: '', business_unit_id: '' });
        fetchUsers();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Gagal menyimpan user');
      }
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Terjadi kesalahan');
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setUserForm({ 
      name: user.name, 
      email: user.email, 
      role_id: user.role_id?.toString() || '', 
      business_unit_id: user.business_unit_id || '' 
    });
    setShowUserForm(true);
  };

  const handleDeleteUser = async (user_id: string) => {
    if (!confirm('Yakin ingin menghapus user ini?')) return;

    try {
      const response = await fetch(`/api/users/${user_id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('User berhasil dihapus');
        fetchUsers();
      } else {
        alert('Gagal menghapus user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Terjadi kesalahan');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">⚙️ Settings</h1>
          <p className="text-gray-600 mt-2">
            Kelola Business Units, Roles, dan Users
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('business')}
              className={`px-6 py-4 font-medium text-sm transition-colors ${
                activeTab === 'business'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🏢 Business Units ({businessUnits.length})
            </button>
            <button
              onClick={() => setActiveTab('roles')}
              className={`px-6 py-4 font-medium text-sm transition-colors ${
                activeTab === 'roles'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              👤 Roles ({roles.length})
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-6 py-4 font-medium text-sm transition-colors ${
                activeTab === 'users'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              👥 Users ({users.length})
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Business Units Tab */}
            {activeTab === 'business' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Business Units</h2>
                  <button
                    onClick={() => {
                      setEditingBU(null);
                      setBuForm({ name: '', description: '' });
                      setShowBUForm(true);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <span>+</span> Tambah Business Unit
                  </button>
                </div>

                {/* BU Form */}
                {showBUForm && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      {editingBU ? 'Edit Business Unit' : 'Tambah Business Unit Baru'}
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nama Business Unit *
                        </label>
                        <input
                          type="text"
                          value={buForm.name}
                          onChange={(e) => setBuForm({ ...buForm, name: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., Marketing, Sales, Engineering"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Deskripsi
                        </label>
                        <textarea
                          value={buForm.description}
                          onChange={(e) => setBuForm({ ...buForm, description: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          rows={3}
                          placeholder="Deskripsi business unit (opsional)"
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={handleSaveBU}
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          💾 Simpan
                        </button>
                        <button
                          onClick={() => {
                            setShowBUForm(false);
                            setEditingBU(null);
                            setBuForm({ name: '', description: '' });
                          }}
                          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                          Batal
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* BU List */}
                {isLoadingBU ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-2">Loading...</p>
                  </div>
                ) : businessUnits.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-600">Belum ada business unit</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {businessUnits.map((bu) => (
                      <div
                        key={bu.bu_id}
                        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">{bu.name}</h3>
                            {bu.description && (
                              <p className="text-sm text-gray-600 mt-1">{bu.description}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-2">
                              ID: {bu.bu_id} • Created: {bu.created_at ? new Date(bu.created_at).toLocaleDateString('id-ID') : 'N/A'}
                            </p>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => handleEditBU(bu)}
                              className="px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors text-sm"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => handleDeleteBU(bu.bu_id)}
                              className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                            >
                              🗑️ Hapus
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Roles Tab */}
            {activeTab === 'roles' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Roles</h2>
                  <button
                    onClick={() => {
                      setEditingRole(null);
                      setRoleForm({ role_name: '', description: '' });
                      setShowRoleForm(true);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <span>+</span> Tambah Role
                  </button>
                </div>

                {/* Role Form */}
                {showRoleForm && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      {editingRole ? 'Edit Role' : 'Tambah Role Baru'}
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nama Role *
                        </label>
                        <input
                          type="text"
                          value={roleForm.role_name}
                          onChange={(e) => setRoleForm({ ...roleForm, role_name: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="e.g., Manager, Staff, Admin"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Deskripsi
                        </label>
                        <textarea
                          value={roleForm.description}
                          onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          rows={3}
                          placeholder="Deskripsi role (opsional)"
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={handleSaveRole}
                          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          💾 Simpan
                        </button>
                        <button
                          onClick={() => {
                            setShowRoleForm(false);
                            setEditingRole(null);
                            setRoleForm({ role_name: '', description: '' });
                          }}
                          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                          Batal
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Role List */}
                {isLoadingRoles ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="text-gray-600 mt-2">Loading...</p>
                  </div>
                ) : roles.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-600">Belum ada role</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {roles.map((role) => (
                      <div
                        key={role.role_id}
                        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">{role.role_name}</h3>
                            {role.description && (
                              <p className="text-sm text-gray-600 mt-1">{role.description}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-2">
                              ID: {role.role_id}
                            </p>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => handleEditRole(role)}
                              className="px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors text-sm"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => handleDeleteRole(role.role_id)}
                              className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                            >
                              🗑️ Hapus
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Users</h2>
                  <button
                    onClick={() => {
                      setEditingUser(null);
                      setUserForm({ name: '', email: '', role_id: '', business_unit_id: '' });
                      setShowUserForm(true);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <span>+</span> Tambah User
                  </button>
                </div>

                {/* User Form */}
                {showUserForm && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      {editingUser ? 'Edit User' : 'Tambah User Baru'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nama *
                        </label>
                        <input
                          type="text"
                          value={userForm.name}
                          onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Nama lengkap"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email *
                        </label>
                        <input
                          type="email"
                          value={userForm.email}
                          onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="email@example.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Role
                        </label>
                        <select
                          value={userForm.role_id}
                          onChange={(e) => setUserForm({ ...userForm, role_id: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          <option value="">-- Pilih Role --</option>
                          {roles.map((role) => (
                            <option key={role.role_id} value={role.role_id}>
                              {role.role_name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Business Unit
                        </label>
                        <select
                          value={userForm.business_unit_id}
                          onChange={(e) => setUserForm({ ...userForm, business_unit_id: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          <option value="">-- Pilih Business Unit --</option>
                          {businessUnits.map((bu) => (
                            <option key={bu.bu_id} value={bu.bu_id}>
                              {bu.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={handleSaveUser}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        💾 Simpan
                      </button>
                      <button
                        onClick={() => {
                          setShowUserForm(false);
                          setEditingUser(null);
                          setUserForm({ name: '', email: '', role_id: '', business_unit_id: '' });
                        }}
                        className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                )}

                {/* User List */}
                {isLoadingUsers ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                    <p className="text-gray-600 mt-2">Loading...</p>
                  </div>
                ) : users.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-600">Belum ada user</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {users.map((user) => (
                      <div
                        key={user.user_id}
                        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                                {user.name.substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                                <p className="text-sm text-gray-600">{user.email}</p>
                              </div>
                            </div>
                            <div className="mt-3 flex gap-4 text-sm">
                              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full">
                                👤 {user.roles?.role_name || 'No Role'}
                              </span>
                              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                                🏢 {user.business_units?.name || 'No BU'}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                              Created: {user.created_at ? new Date(user.created_at).toLocaleDateString('id-ID') : 'N/A'}
                            </p>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => handleEditUser(user)}
                              className="px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors text-sm"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.user_id)}
                              className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                            >
                              🗑️ Hapus
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
