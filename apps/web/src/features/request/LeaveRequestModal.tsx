import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { api } from "../../api/client";

export default function LeaveRequestModal({ isOpen, onClose, initialData, onSuccess }: { isOpen: boolean; onClose: () => void, initialData?: any, onSuccess?: () => void }) {
  const [loading, setLoading] = useState(false);
  const [teams, setTeams] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    type: "SICK",
    startDate: "",
    endDate: "",
    reason: "",
    teamId: "" 
  });

  useEffect(() => {
    if (initialData) {
        setFormData({
            type: initialData.type,
            startDate: initialData.startDate instanceof Date ? initialData.startDate.toISOString().split('T')[0] : String(initialData.startDate).split('T')[0],
            endDate: initialData.endDate instanceof Date ? initialData.endDate.toISOString().split('T')[0] : String(initialData.endDate).split('T')[0],
            reason: initialData.reason || "",
            teamId: initialData.teamId
        });
    } else {
        // Reset form if no initial data
        setFormData({
            type: "SICK",
            startDate: "",
            endDate: "",
            reason: "",
            teamId: "" 
        });
    }
  }, [initialData, isOpen]);

  useEffect(() => {
      if (isOpen) {
          (api.teams as any).index.get().then(({ data }: any) => {
              if (data && Array.isArray(data)) {
                  setTeams(data);
                  if (data.length > 0 && !initialData) {
                      setFormData(prev => ({ ...prev, teamId: data[0].id }));
                  }
              }
          });
      }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
        alert("End date cannot be before start date");
        return;
    }
    setLoading(true);
    try {
        if (initialData) {
            const { error }: any = await (api.leaves as any)({ id: initialData.id }).patch(formData);
            if (error) throw error;
        } else {
            const { error } = await (api.leaves as any).index.post(formData);
            if (error) throw error;
        }
        
        onClose();
        if (onSuccess) {
            onSuccess();
        } else {
            window.location.reload(); 
        }
    } catch (err) {
        console.error("Failed to submit leave request", err);
        alert("Failed to submit request");
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
                        {initialData ? "Edit Leave Request" : "Request Leave"}
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Team</label>
                        <select 
                            className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-gray-900 dark:text-white"
                            value={formData.teamId}
                            onChange={(e) => setFormData({ ...formData, teamId: e.target.value })}
                            required
                        >
                            <option value="" disabled>Select a team</option>
                            {teams.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Leave Type</label>
                        <select 
                            className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-gray-900 dark:text-white"
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                        >
                            <option value="VACATION">Vacation 🏖️</option>
                            <option value="SICK">Sick Leave 🤒</option>
                            <option value="PERSONAL">Personal 🏠</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                            <input 
                                type="date"
                                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-gray-900 dark:text-white"
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
                            <input 
                                type="date"
                                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-gray-900 dark:text-white"
                                value={formData.endDate}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                min={formData.startDate}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reason (Optional)</label>
                        <textarea 
                            className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all h-24 resize-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                            placeholder="Briefly describe why you need leave..."
                            value={formData.reason}
                            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                        />
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
                            disabled={loading}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-200 dark:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Submitting..." : (initialData ? "Save Changes" : "Submit Request")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
