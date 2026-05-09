import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Users, MessageSquare, LogOut, Trash2 } from 'lucide-react';
import { getMe, logout as logoutApi } from '../utils/api';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://codechat-5oju.onrender.com';

const AdminDashboard = ({ authUser, setAuthUser, darkMode, toggleDarkMode }) => {
  const [users, setUsers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authUser || authUser.role !== 'admin') return;

    const fetchAdminData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const headers = { Authorization: `Bearer ${token}` };

        const [usersRes, roomsRes] = await Promise.all([
          fetch(`${BACKEND_URL}/api/admin/users`, { headers }),
          fetch(`${BACKEND_URL}/api/admin/rooms`, { headers })
        ]);

        if (!usersRes.ok || !roomsRes.ok) throw new Error('Failed to fetch data');

        const usersData = await usersRes.json();
        const roomsData = await roomsRes.json();

        setUsers(usersData.data);
        setRooms(roomsData.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [authUser]);

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${BACKEND_URL}/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setUsers(users.filter(u => u._id !== id));
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete user');
      }
    } catch (err) {
      alert('Error deleting user');
    }
  };

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch {}
    localStorage.removeItem('authToken');
    setAuthUser(null);
    navigate('/');
  };

  if (!authUser) {
    return <Navigate to="/" replace />;
  }

  if (authUser.role !== 'admin') {
    return <Navigate to="/chat" replace />;
  }

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <span className="text-lg font-semibold">Loading Admin Dashboard...</span>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <nav className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-6 py-4 flex justify-between items-center`}>
        <div className="flex items-center gap-3">
          <MessageSquare className="text-emerald-500 w-6 h-6" />
          <h1 className="text-xl font-bold">CodeChat Admin</h1>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            {darkMode ? '☀️' : '🌙'}
          </button>
          <span className="font-medium hidden sm:block">Admin: {authUser.username}</span>
          <button onClick={handleLogout} className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6">
        {error && <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
            <h3 className="text-gray-500 dark:text-gray-400 font-medium mb-1">Total Users</h3>
            <p className="text-3xl font-bold">{users.length}</p>
          </div>
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
            <h3 className="text-gray-500 dark:text-gray-400 font-medium mb-1">Active Rooms</h3>
            <p className="text-3xl font-bold">{rooms.length}</p>
          </div>
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
            <h3 className="text-gray-500 dark:text-gray-400 font-medium mb-1">Online Users</h3>
            <p className="text-3xl font-bold text-emerald-500">{users.filter(u => u.isOnline).length}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Users List */}
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-100'} overflow-hidden`}>
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-lg font-semibold flex items-center gap-2"><Users size={18}/> Users Management</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className={`${darkMode ? 'bg-gray-900/50' : 'bg-gray-50'} text-sm`}>
                  <tr>
                    <th className="px-6 py-3 font-medium">Username</th>
                    <th className="px-6 py-3 font-medium">Email</th>
                    <th className="px-6 py-3 font-medium">Role</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                  {users.map(user => (
                    <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-3 font-medium">{user.username}</td>
                      <td className="px-6 py-3 text-gray-500 dark:text-gray-400">{user.email}</td>
                      <td className="px-6 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${user.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <span className={`flex items-center gap-1.5 ${user.isOnline ? 'text-emerald-500' : 'text-gray-400'}`}>
                          <div className={`w-2 h-2 rounded-full ${user.isOnline ? 'bg-emerald-500' : 'bg-gray-400'}`}></div>
                          {user.isOnline ? 'Online' : 'Offline'}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        {user.role !== 'admin' && (
                          <button onClick={() => handleDeleteUser(user._id)} className="text-red-500 hover:text-red-600 transition-colors" title="Delete User">
                            <Trash2 size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Rooms List */}
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-100'} overflow-hidden`}>
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold flex items-center gap-2"><MessageSquare size={18}/> Active Rooms</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className={`${darkMode ? 'bg-gray-900/50' : 'bg-gray-50'} text-sm`}>
                  <tr>
                    <th className="px-6 py-3 font-medium">Room Code</th>
                    <th className="px-6 py-3 font-medium">Type</th>
                    <th className="px-6 py-3 font-medium">Created By</th>
                    <th className="px-6 py-3 font-medium">Created At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                  {rooms.map(room => (
                    <tr key={room._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-3 font-bold text-emerald-600 dark:text-emerald-400">{room.roomCode}</td>
                      <td className="px-6 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${room.type === 'private' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'}`}>
                          {room.type}
                        </span>
                      </td>
                      <td className="px-6 py-3">{room.createdBy?.username || 'Guest'}</td>
                      <td className="px-6 py-3 text-gray-500 dark:text-gray-400">{new Date(room.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;