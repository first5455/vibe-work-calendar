import { useState, useEffect } from "react";
import { X, Search, UserPlus } from "lucide-react";
import { api } from "../../api/client";

export default function AddMemberModal({ isOpen, onClose, teamId, onSuccess }: { isOpen: boolean; onClose: () => void, teamId: string, onSuccess?: () => void }) {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [role, setRole] = useState<"MEMBER" | "ADMIN">("MEMBER");
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!isOpen) {
        setSearchQuery("");
        setSearchResults([]);
        setSelectedUser(null);
        setRole("MEMBER");
    }
  }, [isOpen]);

  useEffect(() => {
      const ms = 300;
      const timeoutId = setTimeout(async () => {
          if (searchQuery.length >= 2) {
              setSearching(true);
              try {
                  const { data } = await (api.users as any).search.get({ query: { q: searchQuery } });
                  if (data) {
                      setSearchResults(data);
                  }
              } catch (e) {
                  console.error("Search failed", e);
              } finally {
                  setSearching(false);
              }
          } else {
              setSearchResults([]);
          }
      }, ms);
      return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    setLoading(true);
    try {
        const { error } = await (api.teams as any)({ id: teamId }).members.post({
            userId: selectedUser.id,
            role
        });
        
        if (error) throw error;
        
        onClose();
        if (onSuccess) {
            onSuccess();
        } else {
            window.location.reload(); 
        }
    } catch (err) {
        console.error("Failed to add member", err);
        alert("Failed to add member");
    } finally {
        setLoading(false);
    }
  };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Add Team Member
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search User</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input 
                                type="text"
                                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400"
                                placeholder="Search by name or email..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    if (selectedUser) setSelectedUser(null);
                                }}
                            />
                        </div>
                        
                        {/* Search Results */}
                        {searchQuery.length >= 2 && !selectedUser && (
                            <div className="mt-2 border border-gray-200 dark:border-gray-700 rounded-lg max-h-48 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
                                {searching ? (
                                    <div className="p-3 text-center text-xs text-gray-500">Searching...</div>
                                ) : searchResults.length === 0 ? (
                                    <div className="p-3 text-center text-xs text-gray-500">No users found</div>
                                ) : (
                                    searchResults.map(user => (
                                        <div 
                                            key={user.id} 
                                            onClick={() => {
                                                setSelectedUser(user);
                                                setSearchQuery(user.displayName);
                                                setSearchResults([]);
                                            }}
                                            className="p-2 flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-xs font-bold">
                                                {user.avatarUrl ? <img src={user.avatarUrl} className="w-full h-full rounded-full object-cover" referrerPolicy="no-referrer" /> : user.displayName.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">{user.displayName}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    {selectedUser && (
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-lg flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-xs font-bold">
                                    {selectedUser.avatarUrl ? <img src={selectedUser.avatarUrl} className="w-full h-full rounded-full object-cover" referrerPolicy="no-referrer" /> : selectedUser.displayName.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedUser.displayName}</p>
                                    <p className="text-xs text-indigo-600 dark:text-indigo-300">Selected</p>
                                </div>
                            </div>
                            <button onClick={() => { setSelectedUser(null); setSearchQuery(""); }} className="text-gray-400 hover:text-gray-600">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Role</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button" 
                                onClick={() => setRole("MEMBER")}
                                className={`flex items-center justify-center px-4 py-2 border rounded-lg text-sm font-medium transition-all ${
                                    role === "MEMBER" 
                                        ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300" 
                                        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                                }`}
                            >
                                Member
                            </button>
                            <button 
                                type="button"
                                onClick={() => setRole("ADMIN")}
                                className={`flex items-center justify-center px-4 py-2 border rounded-lg text-sm font-medium transition-all ${
                                    role === "ADMIN" 
                                        ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300" 
                                        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                                }`}
                            >
                                Admin
                            </button>
                        </div>
                    </div>

                    <div className="pt-2 flex justify-end space-x-3">
                        <button 
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            disabled={loading || !selectedUser}
                            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-200 dark:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Adding..." : <><UserPlus className="w-4 h-4 mr-2" /> Add Member</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
