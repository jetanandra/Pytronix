import React, { useEffect, useState } from 'react';
import { getAllUsers, adminUserAction } from '../../services/userService';
import { User, Profile } from '../../types';
import { Shield, Trash, Ban, UserCheck, Loader2, Download, ArrowUp, ArrowDown } from 'lucide-react';

function exportToCSV(users: any[]) {
  const headers = ['Email', 'Full Name', 'Phone', 'Role', 'Status', 'Created'];
  const rows = users.map(u => [
    u.email,
    u.profile?.full_name || '',
    u.profile?.phone || '',
    u.role,
    u.banned ? 'Banned' : 'Active',
    new Date(u.created_at).toLocaleDateString()
  ]);
  const csv = [headers, ...rows].map(r => r.map(x => `"${x}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'users.csv';
  a.click();
  URL.revokeObjectURL(url);
}

const UserList: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllUsers();
      setUsers(data);
      setFiltered(data);
    } catch (err) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      users.filter(u =>
        u.email.toLowerCase().includes(q) ||
        (u.profile?.full_name || '').toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q) ||
        (u.banned ? 'banned' : 'active').includes(q)
      )
    );
  }, [search, users]);

  const handleAction = async (userId: string, action: string) => {
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;
    setActionLoading(userId + action);
    try {
      await adminUserAction(userId, action as any);
      await fetchUsers();
    } catch (err) {
      alert('Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const handleSelectAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map(u => u.id)));
  };

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="animate-spin w-8 h-8 text-neon-blue" /></div>;
  if (error) return <div className="text-red-600 text-center py-8">{error}</div>;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Users</h1>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by email, name, role, status..."
          className="w-full md:w-72 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-dark-navy focus:outline-none focus:ring-2 focus:ring-neon-blue"
        />
        <button
          className="btn-secondary flex items-center gap-2 px-4 py-2 rounded-lg"
          onClick={() => exportToCSV(users.filter(u => selected.has(u.id)))}
          disabled={selected.size === 0}
        >
          <Download className="w-4 h-4" /> Export Selected
        </button>
      </div>
      <div className="overflow-x-auto bg-white dark:bg-light-navy rounded-lg shadow p-4">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead>
            <tr>
              <th className="px-2 py-2"><input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0} onChange={handleSelectAll} /></th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Full Name</th>
              <th className="px-4 py-2 text-left">Phone</th>
              <th className="px-4 py-2 text-left">Role</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Created</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="border-b border-gray-100 dark:border-gray-800">
                <td className="px-2 py-2 text-center">
                  <input type="checkbox" checked={selected.has(u.id)} onChange={() => handleSelect(u.id)} />
                </td>
                <td className="px-4 py-2">{u.email}</td>
                <td className="px-4 py-2 flex items-center gap-2">
                  {u.profile?.profile_picture && (
                    <img src={u.profile.profile_picture} alt="Profile" className="w-7 h-7 rounded-full object-cover border" />
                  )}
                  {u.profile?.full_name || '-'}
                </td>
                <td className="px-4 py-2">{u.profile?.phone || '-'}</td>
                <td className="px-4 py-2">
                  {u.role === 'admin' ? (
                    <span className="inline-flex items-center text-green-600 font-semibold"><Shield className="w-4 h-4 mr-1" /> Admin</span>
                  ) : (
                    <span className="text-gray-700 dark:text-soft-gray">User</span>
                  )}
                </td>
                <td className="px-4 py-2">
                  {u.banned ? (
                    <span className="text-red-600 font-semibold flex items-center"><Ban className="w-4 h-4 mr-1" />Banned</span>
                  ) : (
                    <span className="text-green-600 font-semibold flex items-center"><UserCheck className="w-4 h-4 mr-1" />Active</span>
                  )}
                </td>
                <td className="px-4 py-2">{new Date(u.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-2 space-x-1 flex items-center">
                  {u.role !== 'admin' ? (
                    <button
                      className="btn-xs bg-green-100 text-green-700 rounded p-1"
                      disabled={actionLoading === u.id + 'promote'}
                      onClick={() => handleAction(u.id, 'promote')}
                      title="Promote to Admin"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      className="btn-xs bg-yellow-100 text-yellow-700 rounded p-1"
                      disabled={actionLoading === u.id + 'demote'}
                      onClick={() => handleAction(u.id, 'demote')}
                      title="Demote to User"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  )}
                  {u.banned ? (
                    <button
                      className="btn-xs bg-blue-100 text-blue-700 rounded p-1"
                      disabled={actionLoading === u.id + 'unban'}
                      onClick={() => handleAction(u.id, 'unban')}
                      title="Unban User"
                    >
                      <UserCheck className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      className="btn-xs bg-red-100 text-red-700 rounded p-1"
                      disabled={actionLoading === u.id + 'ban'}
                      onClick={() => handleAction(u.id, 'ban')}
                      title="Ban User"
                    >
                      <Ban className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    className="btn-xs bg-gray-200 text-gray-700 rounded p-1"
                    disabled={actionLoading === u.id + 'delete'}
                    onClick={() => handleAction(u.id, 'delete')}
                    title="Delete User"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserList;