import React, { useState, useEffect } from 'react';
import { X, Users, Shield, Mail, IdCard, Search, Loader2, UserCircle } from 'lucide-react';
import { authService } from '../../api/service';

const UserManagementModal = ({ isOpen, onClose }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await authService.getUsers();
      setUsers(data);
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.school_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[85vh]">
        <div className="bg-blue-600 p-6 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black font-outfit">User Management</h2>
              <p className="text-white/70 text-xs font-bold uppercase tracking-wider">System Directory</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 border-b border-gray-100 bg-gray-50 flex flex-col md:flex-row gap-4 items-center shrink-0">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text"
              placeholder="Search by name, ID or email..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={fetchUsers}
            className="px-6 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition-all shadow-sm shrink-0"
          >
            Refresh List
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
              <p className="text-gray-500 font-bold font-outfit">Loading users...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500 font-bold">{error}</div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-20 text-gray-400 font-bold font-outfit bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
              No users found matching your search.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredUsers.map(user => (
                <div key={user.id} className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-start gap-4 group">
                  <div className="relative">
                    <UserCircle className="w-12 h-12 text-gray-300 group-hover:text-blue-500 transition-colors" />
                    <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white ${user.role === 'admin' ? 'bg-red-500' : user.role === 'staff' ? 'bg-blue-500' : 'bg-cpsu-green'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-black text-gray-900 truncate font-outfit">{user.name}</h3>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter ${
                        user.role === 'admin' ? 'bg-red-100 text-red-600' : 
                        user.role === 'staff' ? 'bg-blue-100 text-blue-600' : 
                        'bg-emerald-100 text-emerald-600'
                      }`}>
                        {user.role}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-gray-500 font-bold">
                        <IdCard className="w-3.5 h-3.5" />
                        {user.school_id}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 font-bold">
                        <Mail className="w-3.5 h-3.5" />
                        {user.email}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500 font-bold shrink-0">
           <span>Total: {filteredUsers.length} users</span>
           <span className="flex items-center gap-1">
             <div className="w-2 h-2 rounded-full bg-red-500" /> Admin
             <div className="w-2 h-2 rounded-full bg-blue-500 ml-2" /> Staff
             <div className="w-2 h-2 rounded-full bg-cpsu-green ml-2" /> Student
           </span>
        </div>
      </div>
    </div>
  );
};

export default UserManagementModal;
