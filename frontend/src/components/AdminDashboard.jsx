import { useState, useEffect, useCallback } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  Users, MessageSquare, LogOut, Trash2, Shield, ShieldOff,
  Search, RefreshCw, ChevronLeft, ChevronRight, Moon, Sun,
  BarChart2, Hash, Radio, ArrowUpCircle, ArrowDownCircle,
  Eye, X, Send, AlertTriangle, CheckCircle, TrendingUp
} from 'lucide-react';
import { logout as logoutApi } from '../utils/api';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://codechat-5oju.onrender.com';

const adminFetch = async (path, options = {}) => {
  const token = localStorage.getItem('authToken');
  const res = await fetch(`${BACKEND_URL}/api/admin${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
};

const MiniBarChart = ({ data = [], color = '#25d366' }) => {
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div className="flex items-end gap-1 h-16">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-0.5" title={`${d.label}: ${d.count}`}>
          <div
            className="w-full rounded-t-sm transition-all duration-500"
            style={{ height: `${(d.count / max) * 100}%`, backgroundColor: color, minHeight: d.count > 0 ? 4 : 0 }}
          />
          <span className="text-[8px] text-gray-400 leading-none">{d.label}</span>
        </div>
      ))}
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, sub, color = 'text-[#25d366]' }) => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm flex items-start justify-between">
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${color}`}>{value ?? '—'}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
    <div className={`p-2.5 rounded-xl bg-gray-50 dark:bg-gray-700 ${color}`}>
      <Icon size={20} />
    </div>
  </div>
);

const Toast = ({ msg, type = 'success', onClose }) => (
  <div className={`fixed bottom-6 right-6 z-[999] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium ${
    type === 'success'
      ? 'bg-emerald-50 dark:bg-emerald-900/40 border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300'
      : 'bg-red-50 dark:bg-red-900/40 border-red-200 dark:border-red-700 text-red-700 dark:text-red-300'
  }`}>
    {type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
    {msg}
    <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100"><X size={14} /></button>
  </div>
);

const RoleBadge = ({ role }) => (
  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
    role === 'admin'
      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
      : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
  }`}>{role}</span>
);

const Pagination = ({ page, totalPages, onChange }) => (
  <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-700">
    <span className="text-xs text-gray-400">Page {page} of {totalPages || 1}</span>
    <div className="flex gap-1">
      <button disabled={page <= 1} onClick={() => onChange(page - 1)}
        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 transition-colors">
        <ChevronLeft size={16} />
      </button>
      <button disabled={page >= totalPages} onClick={() => onChange(page + 1)}
        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 transition-colors">
        <ChevronRight size={16} />
      </button>
    </div>
  </div>
);

function ActionBtn({ icon: Icon, label, color, onClick }) {
  return (
    <button onClick={onClick} title={label}
      className={`p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${color}`}>
      <Icon size={15} />
    </button>
  );
}

export default function AdminDashboard({ authUser, setAuthUser, darkMode, toggleDarkMode }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [usersMeta, setUsersMeta] = useState({ page: 1, totalPages: 1 });
  const [usersPage, setUsersPage] = useState(1);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [rooms, setRooms] = useState([]);
  const [roomsMeta, setRoomsMeta] = useState({ page: 1, totalPages: 1 });
  const [roomsPage, setRoomsPage] = useState(1);
  const [roomMessages, setRoomMessages] = useState([]);
  const [roomMsgMeta, setRoomMsgMeta] = useState({ page: 1, totalPages: 1 });
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [broadcastText, setBroadcastText] = useState('');
  const [broadcastSent, setBroadcastSent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadStats = useCallback(async () => {
    try {
      const data = await adminFetch('/stats');
      setStats(data.data ?? data);
    } catch (e) { console.error('Stats error:', e); }
  }, []);

  const loadUsers = useCallback(async (page = 1) => {
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (userSearch) params.set('q', userSearch);
      if (userRoleFilter) params.set('role', userRoleFilter);
      const data = await adminFetch(`/users?${params}`);
      setUsers(data.data);
      setUsersMeta({ page: data.page ?? page, totalPages: data.totalPages ?? 1 });
    } catch (e) { showToast(e.message, 'error'); }
  }, [userSearch, userRoleFilter]);

  const loadRooms = useCallback(async (page = 1) => {
    try {
      const data = await adminFetch(`/rooms?page=${page}&limit=15`);
      setRooms(data.data);
      setRoomsMeta({ page: data.page ?? page, totalPages: data.totalPages ?? 1 });
    } catch (e) { showToast(e.message, 'error'); }
  }, []);

  useEffect(() => {
    if (!authUser || authUser.role !== 'admin') return;
    Promise.all([loadStats(), loadUsers(1), loadRooms(1)]).finally(() => setLoading(false));
  }, [authUser]);

  useEffect(() => {
    if (!loading) {
      const t = setTimeout(() => { setUsersPage(1); loadUsers(1); }, 400);
      return () => clearTimeout(t);
    }
  }, [userSearch, userRoleFilter]);

  useEffect(() => { if (!loading) loadUsers(usersPage); }, [usersPage]);
  useEffect(() => { if (!loading) loadRooms(roomsPage); }, [roomsPage]);

  const openRoomMessages = async (roomCode, page = 1) => {
    setSelectedRoom(roomCode);
    setTab('messages');
    try {
      const data = await adminFetch(`/rooms/${roomCode}/messages?page=${page}&limit=20`);
      setRoomMessages(data.data);
      setRoomMsgMeta({ page: data.page ?? page, totalPages: data.totalPages ?? 1 });
    } catch (e) { showToast(e.message, 'error'); }
  };

  const userAction = async (userId, action, label) => {
    if (!window.confirm(`${label}?`)) return;
    try {
      const methodMap = { delete: 'DELETE', ban: 'PATCH', unban: 'PATCH', promote: 'PATCH', demote: 'PATCH' };
      const pathMap = {
        delete: `/users/${userId}`,
        ban: `/users/${userId}/ban`,
        unban: `/users/${userId}/unban`,
        promote: `/users/${userId}/promote`,
        demote: `/users/${userId}/demote`,
      };
      await adminFetch(pathMap[action], { method: methodMap[action] });
      showToast(`Action "${action}" successful`);
      loadUsers(usersPage);
      loadStats();
    } catch (e) { showToast(e.message, 'error'); }
  };

  const deleteRoom = async (id) => {
    if (!window.confirm('Delete this room permanently?')) return;
    try {
      await adminFetch(`/rooms/${id}`, { method: 'DELETE' });
      showToast('Room deleted');
      loadRooms(roomsPage);
      loadStats();
    } catch (e) { showToast(e.message, 'error'); }
  };

  const sendBroadcast = async () => {
    if (!broadcastText.trim()) return;
    try {
      await adminFetch('/broadcast', { method: 'POST', body: JSON.stringify({ text: broadcastText }) });
      setBroadcastSent(true);
      setBroadcastText('');
      showToast('Broadcast sent to all rooms!');
      setTimeout(() => setBroadcastSent(false), 3000);
    } catch (e) { showToast(e.message, 'error'); }
  };

  const refreshAll = async () => {
    setRefreshing(true);
    await Promise.all([loadStats(), loadUsers(usersPage), loadRooms(roomsPage)]);
    setRefreshing(false);
    showToast('Data refreshed');
  };

  const handleLogout = async () => {
    try { await logoutApi(); } catch {}
    localStorage.removeItem('authToken');
    setAuthUser(null);
    navigate('/app');
  };

  if (!authUser) return <Navigate to="/app" replace />;
  if (authUser.role !== 'admin') return <Navigate to="/chat" replace />;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#25d366] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">Loading Admin Panel...</p>
        </div>
      </div>
    );
  }

  const TABS = [
    { id: 'overview', label: 'Overview', icon: BarChart2 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'rooms', label: 'Rooms', icon: Hash },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'broadcast', label: 'Broadcast', icon: Radio },
  ];

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toLocaleDateString('en', { weekday: 'short' });
  });

  const userGrowthData = last7Days.map((label, i) => ({ label, count: stats?.userGrowth?.[i] ?? 0 }));
  const msgActivityData = last7Days.map((label, i) => ({ label, count: stats?.messageActivity?.[i] ?? 0 }));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">

      {/* Top Nav */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-3 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#25d366]/10 flex items-center justify-center">
            <Shield size={18} className="text-[#25d366]" />
          </div>
          <div>
            <h1 className="text-base font-bold leading-none">CodeChat Admin</h1>
            <p className="text-[10px] text-gray-400 leading-none mt-0.5">Management Panel</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={refreshAll} title="Refresh all data"
            className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 ${refreshing ? 'animate-spin' : ''}`}>
            <RefreshCw size={16} />
          </button>
          <button onClick={toggleDarkMode}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500">
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm font-medium">
            <div className="w-2 h-2 rounded-full bg-[#25d366]" />
            {authUser.username}
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors">
            <LogOut size={14} /> Logout
          </button>
        </div>
      </nav>

      {/* Tab Bar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6">
        <div className="flex overflow-x-auto">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                tab === id
                  ? 'border-[#25d366] text-[#128c7e] dark:text-[#25d366]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}>
              <Icon size={15} />
              {label}
              {id === 'users' && stats && (
                <span className="ml-1 px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full text-[10px]">{stats.totalUsers}</span>
              )}
              {id === 'rooms' && stats && (
                <span className="ml-1 px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full text-[10px]">{stats.totalRooms}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto p-4 sm:p-6">

        {/* ── OVERVIEW ─────────────────────────────────────────── */}
        {tab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={Users} label="Total Users" value={stats?.totalUsers}
                sub={`${stats?.todayNewUsers ?? 0} joined today`} color="text-blue-500" />
              <StatCard icon={Users} label="Online Now" value={stats?.onlineUsers}
                sub={`${stats?.guestUsers ?? 0} guests`} color="text-[#25d366]" />
              <StatCard icon={Hash} label="Total Rooms" value={stats?.totalRooms} color="text-amber-500" />
              <StatCard icon={MessageSquare} label="Messages" value={stats?.totalMessages}
                sub={`${stats?.todayMessages ?? 0} today`} color="text-indigo-500" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp size={16} className="text-blue-500" />
                  <h3 className="font-semibold text-sm">New Users — Last 7 Days</h3>
                </div>
                <MiniBarChart data={userGrowthData} color="#3b82f6" />
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <MessageSquare size={16} className="text-[#25d366]" />
                  <h3 className="font-semibold text-sm">Messages — Last 7 Days</h3>
                </div>
                <MiniBarChart data={msgActivityData} color="#25d366" />
              </div>
            </div>

            {stats?.messagesPerRoom?.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
                  <BarChart2 size={16} className="text-amber-500" />
                  <h3 className="font-semibold text-sm">Top 5 Rooms by Messages</h3>
                </div>
                <div className="divide-y divide-gray-50 dark:divide-gray-700">
                  {stats.messagesPerRoom.map((r, i) => {
                    const max = stats.messagesPerRoom[0]?.count || 1;
                    return (
                      <div key={r.roomCode} className="px-5 py-3 flex items-center gap-4">
                        <span className="w-5 text-xs text-gray-400 font-bold">#{i + 1}</span>
                        <span className="font-bold text-[#128c7e] dark:text-[#25d366] text-sm w-24">{r.roomCode}</span>
                        <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                          <div className="h-full rounded-full bg-[#25d366]"
                            style={{ width: `${(r.count / max) * 100}%` }} />
                        </div>
                        <span className="text-xs text-gray-500 w-16 text-right">{r.count} msgs</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── USERS ─────────────────────────────────────────────── */}
        {tab === 'users' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-[180px]">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" value={userSearch} onChange={e => setUserSearch(e.target.value)}
                  placeholder="Search by name or email…"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#25d366]/40" />
              </div>
              <select value={userRoleFilter} onChange={e => setUserRoleFilter(e.target.value)}
                className="text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#25d366]/40">
                <option value="">All Roles</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              <span className="text-xs text-gray-400 ml-auto">{users.length} shown</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-gray-900/40">
                  <tr>
                    {['User', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                      <th key={h} className="px-5 py-3 font-semibold text-xs text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                  {users.map(user => (
                    <tr key={user._id}
                      className={`hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors ${user.isBanned ? 'opacity-50' : ''}`}>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#25d366]/10 flex items-center justify-center text-[#128c7e] dark:text-[#25d366] text-xs font-bold flex-shrink-0">
                            {user.username?.[0]?.toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold truncate">{user.username}</p>
                            <p className="text-xs text-gray-400 truncate">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3"><RoleBadge role={user.role} /></td>
                      <td className="px-5 py-3">
                        {user.isBanned ? (
                          <span className="flex items-center gap-1.5 text-red-500 text-xs font-medium">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500" /> Banned
                          </span>
                        ) : (
                          <span className={`flex items-center gap-1.5 text-xs font-medium ${user.isOnline ? 'text-[#25d366]' : 'text-gray-400'}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${user.isOnline ? 'bg-[#25d366]' : 'bg-gray-400'}`} />
                            {user.isOnline ? 'Online' : 'Offline'}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-xs text-gray-400">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en', { day: 'numeric', month: 'short', year: '2-digit' }) : '—'}
                      </td>
                      <td className="px-5 py-3">
                        {user.role !== 'admin' && (
                          <div className="flex items-center gap-1">
                            {user.isBanned
                              ? <ActionBtn icon={ShieldOff} label="Unban" color="text-[#25d366]" onClick={() => userAction(user._id, 'unban', `Unban ${user.username}`)} />
                              : <ActionBtn icon={Shield} label="Ban" color="text-amber-500" onClick={() => userAction(user._id, 'ban', `Ban ${user.username}`)} />
                            }
                            <ActionBtn icon={ArrowUpCircle} label="Promote to Admin" color="text-indigo-500"
                              onClick={() => userAction(user._id, 'promote', `Promote ${user.username} to Admin`)} />
                            <ActionBtn icon={Trash2} label="Delete User" color="text-red-500"
                              onClick={() => userAction(user._id, 'delete', `Delete user ${user.username}`)} />
                          </div>
                        )}
                        {user.role === 'admin' && user._id !== authUser._id && (
                          <ActionBtn icon={ArrowDownCircle} label="Demote to User" color="text-amber-500"
                            onClick={() => userAction(user._id, 'demote', `Demote ${user.username} to User`)} />
                        )}
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr><td colSpan={5} className="px-5 py-12 text-center text-gray-400 text-sm">No users found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <Pagination page={usersMeta.page} totalPages={usersMeta.totalPages} onChange={setUsersPage} />
          </div>
        )}

        {/* ── ROOMS ─────────────────────────────────────────────── */}
        {tab === 'rooms' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <h2 className="font-semibold flex items-center gap-2"><Hash size={16} /> All Rooms</h2>
              <span className="text-xs text-gray-400">{rooms.length} shown</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-gray-900/40">
                  <tr>
                    {['Room Code', 'Type', 'Created By', 'Members', 'Messages', 'Created', 'Actions'].map(h => (
                      <th key={h} className="px-5 py-3 font-semibold text-xs text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                  {rooms.map(room => (
                    <tr key={room._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-5 py-3 font-bold text-[#128c7e] dark:text-[#25d366]">{room.roomCode}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          room.type === 'private'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                            : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                        }`}>{room.type}</span>
                      </td>
                      <td className="px-5 py-3 text-gray-500">{room.createdBy?.username || 'Guest'}</td>
                      <td className="px-5 py-3 text-gray-500">{room.membersCount ?? room.members?.length ?? 0}</td>
                      <td className="px-5 py-3 text-gray-500">{room.messageCount ?? '—'}</td>
                      <td className="px-5 py-3 text-xs text-gray-400">
                        {room.createdAt ? new Date(room.createdAt).toLocaleDateString('en', { day: 'numeric', month: 'short', year: '2-digit' }) : '—'}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1">
                          <ActionBtn icon={Eye} label="View Messages" color="text-blue-500"
                            onClick={() => openRoomMessages(room.roomCode)} />
                          <ActionBtn icon={Trash2} label="Delete Room" color="text-red-500"
                            onClick={() => deleteRoom(room._id)} />
                        </div>
                      </td>
                    </tr>
                  ))}
                  {rooms.length === 0 && (
                    <tr><td colSpan={7} className="px-5 py-12 text-center text-gray-400 text-sm">No rooms found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <Pagination page={roomsMeta.page} totalPages={roomsMeta.totalPages} onChange={setRoomsPage} />
          </div>
        )}

        {/* ── MESSAGES ──────────────────────────────────────────── */}
        {tab === 'messages' && (
          <div>
            {!selectedRoom ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-12 text-center">
                <MessageSquare size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-gray-400 text-sm">Go to the <strong>Rooms</strong> tab and click the eye icon to view a room's messages.</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                  <h2 className="font-semibold flex items-center gap-2">
                    <Hash size={16} className="text-[#25d366]" />
                    Room: <span className="text-[#25d366]">{selectedRoom}</span>
                  </h2>
                  <button onClick={() => { setSelectedRoom(null); setRoomMessages([]); setTab('rooms'); }}
                    className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex items-center gap-1">
                    <X size={14} /> Close
                  </button>
                </div>
                <div className="divide-y divide-gray-50 dark:divide-gray-700 max-h-[60vh] overflow-y-auto">
                  {roomMessages.map((msg, i) => (
                    <div key={msg._id ?? i} className="px-5 py-3 flex gap-3 items-start hover:bg-gray-50 dark:hover:bg-gray-700/20">
                      <div className="w-7 h-7 rounded-full bg-[#25d366]/10 flex items-center justify-center text-[#128c7e] dark:text-[#25d366] text-xs font-bold flex-shrink-0 mt-0.5">
                        {(msg.sender || msg.senderId?.username || '?')[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="font-semibold text-sm">{msg.sender || msg.senderId?.username || 'Unknown'}</span>
                          <span className="text-[10px] text-gray-400">{msg.timestamp ? new Date(msg.timestamp).toLocaleString() : ''}</span>
                          {msg.isDeleted && <span className="text-[10px] text-red-400">deleted</span>}
                        </div>
                        {msg.isDeleted
                          ? <p className="text-xs text-gray-400 italic mt-0.5">Message deleted</p>
                          : <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5 whitespace-pre-wrap break-words">{msg.message || msg.text}</p>
                        }
                        {msg.attachment?.name && <p className="text-xs text-blue-500 mt-0.5">📎 {msg.attachment.name}</p>}
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                        msg.messageType === 'image' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                        msg.messageType === 'audio' ? 'bg-purple-100 text-purple-600' :
                        msg.messageType === 'file' ? 'bg-amber-100 text-amber-600' :
                        'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                      }`}>{msg.messageType || 'text'}</span>
                    </div>
                  ))}
                  {roomMessages.length === 0 && (
                    <p className="text-center text-gray-400 text-sm py-12">No messages in this room</p>
                  )}
                </div>
                <Pagination
                  page={roomMsgMeta.page}
                  totalPages={roomMsgMeta.totalPages}
                  onChange={(p) => openRoomMessages(selectedRoom, p)}
                />
              </div>
            )}
          </div>
        )}

        {/* ── BROADCAST ─────────────────────────────────────────── */}
        {tab === 'broadcast' && (
          <div className="max-w-2xl space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
                <h2 className="font-semibold flex items-center gap-2"><Radio size={16} className="text-[#25d366]" /> System Broadcast</h2>
                <p className="text-xs text-gray-400 mt-1">Send an announcement to all active rooms instantly.</p>
              </div>
              <div className="p-6 space-y-4">
                <textarea
                  value={broadcastText}
                  onChange={e => setBroadcastText(e.target.value)}
                  rows={5}
                  placeholder="Type your system announcement here…"
                  className="w-full px-4 py-3 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#25d366]/40 resize-none text-gray-800 dark:text-gray-100 placeholder-gray-400"
                />
                <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-700">
                  <AlertTriangle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    All connected users in <strong>all active rooms</strong> will see this message immediately.
                  </p>
                </div>
                {broadcastSent && (
                  <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400 text-sm font-medium">
                    <CheckCircle size={16} /> Broadcast sent successfully!
                  </div>
                )}
                <button onClick={sendBroadcast} disabled={!broadcastText.trim()}
                  className="w-full flex items-center justify-center gap-2 bg-[#00a884] hover:bg-[#008f72] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-colors shadow-sm">
                  <Send size={16} /> Send Broadcast
                </button>
              </div>
            </div>

            {/* Quick templates */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
              <h3 className="text-sm font-semibold mb-3 text-gray-600 dark:text-gray-400">Quick Templates</h3>
              <div className="space-y-2">
                {[
                  '🔧 System maintenance in 10 minutes. Please save your work.',
                  '✅ System update complete. All services running normally.',
                  '⚠️ We are experiencing issues. Our team is on it.',
                  '🚀 New features deployed! Check them out.',
                ].map((t, i) => (
                  <button key={i} onClick={() => setBroadcastText(t)}
                    className="w-full text-left text-sm px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-gray-700 dark:text-gray-300">
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
