import { useState, useEffect } from "react";
import { X, Paperclip, Trash2 } from "lucide-react";
import { api } from "../../api/client";
import FileUpload from "../../components/upload/FileUpload";

interface LeaveRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialData?: any;
    readOnly?: boolean;
}

export default function LeaveRequestModal({ isOpen, onClose, onSuccess, initialData, readOnly = false }: LeaveRequestModalProps) {
    const [loading, setLoading] = useState(false);
    const [existingAttachments, setExistingAttachments] = useState<any[]>([]);
    const [newAttachments, setNewAttachments] = useState<any[]>([]);
    const [teams, setTeams] = useState<any[]>([]);
    
    const [formData, setFormData] = useState({
        type: 'SICK',
        startDate: '',
        endDate: '',
        reason: '',
        teamId: undefined as string | undefined
    });

    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const { data } = await (api.teams as any).get();
                if (data) setTeams(data);
            } catch (error) {
                console.error("Failed to fetch teams", error);
            }
        };
        fetchTeams();
    }, []);

    useEffect(() => {
        if (initialData) {
            setFormData({
                type: initialData.type,
                startDate: initialData.startDate instanceof Date ? initialData.startDate.toISOString().split('T')[0] : String(initialData.startDate).split('T')[0],
                endDate: initialData.endDate instanceof Date ? initialData.endDate.toISOString().split('T')[0] : String(initialData.endDate).split('T')[0],
                reason: initialData.reason || "",
                teamId: initialData.teamId
            });
            setExistingAttachments(initialData.attachments || []);
        } else {
            setFormData({
                type: 'SICK',
                startDate: '',
                endDate: '',
                reason: '',
                teamId: undefined
            });
            setExistingAttachments([]);
        }
        setNewAttachments([]);
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleDeleteLeave = async () => {
        if (!initialData) return;
        if (!confirm("Are you sure you want to delete this leave request?")) return;
        setLoading(true);
        try {
            await (api.leaves as any)({ id: initialData.id }).delete();
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            alert("Failed to delete leave");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Combine existing (that weren't deleted) and new attachments
            const combinedAttachments = [
                ...existingAttachments.map(att => ({
                    fileKey: att.fileKey,
                    originalName: att.originalName,
                    mimeType: att.mimeType,
                    fileUrl: att.fileUrl
                })),
                ...newAttachments
            ];

            const payload = {
                ...formData,
                // Send YYYY-MM-DD strings directly, avoid timezone shifts from new Date().toJSON()
                startDate: formData.startDate, 
                endDate: formData.endDate,
                // Send null if teamId is undefined purely to handle "Clearing" the field if backend supports it
                teamId: formData.teamId === undefined ? null : formData.teamId,
                attachments: combinedAttachments
            };

            if (initialData) {
                await (api.leaves as any)({ id: initialData.id }).patch(payload);
            } else {
                await (api.leaves as any).post(payload);
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            alert("Failed to save leave");
        } finally {
            setLoading(false);
        }
    };

    const removeExistingAttachment = (index: number) => {
        setExistingAttachments(prev => prev.filter((_, i) => i !== index));
    };
    
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {readOnly ? "Leave Details" : (initialData ? "Edit Leave" : "Save Leave")}
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>
                
                <div className="overflow-y-auto p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Team Context</label>
                        <select 
                            value={formData.teamId || ""}
                            disabled={readOnly}
                            onChange={e => setFormData({...formData, teamId: e.target.value === "" ? undefined : e.target.value})}
                            className="w-full px-4 py-2.5 rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-70 disabled:bg-gray-100 dark:disabled:bg-gray-800"
                        >
                            <option value="">Personal Leave (No Team)</option>
                            {teams.map(team => (
                                <option key={team.id} value={team.id}>{team.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                        <select 
                            value={formData.type}
                            disabled={readOnly}
                            onChange={e => setFormData({...formData, type: e.target.value})}
                            className="w-full px-4 py-2.5 rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-70 disabled:bg-gray-100 dark:disabled:bg-gray-800"
                        >
                            <option value="SICK">Sick Leave 🤒</option>
                            <option value="VACATION">Vacation 🏖️</option>
                            <option value="WFH">Work from Home 🏠</option>
                            <option value="PERSONAL">Personal Leave 👤</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                            <input 
                                type="date"
                                required
                                disabled={readOnly}
                                value={formData.startDate}
                                onChange={e => setFormData({...formData, startDate: e.target.value})}
                                className="w-full px-4 py-2.5 rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-70 disabled:bg-gray-100 dark:disabled:bg-gray-800"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
                            <input 
                                type="date"
                                required
                                disabled={readOnly}
                                value={formData.endDate}
                                onChange={e => setFormData({...formData, endDate: e.target.value})}
                                className="w-full px-4 py-2.5 rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-70 disabled:bg-gray-100 dark:disabled:bg-gray-800"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reason</label>
                        <textarea 
                            value={formData.reason}
                            disabled={readOnly}
                            onChange={e => setFormData({...formData, reason: e.target.value})}
                            className="w-full px-4 py-2.5 rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-70 disabled:bg-gray-100 dark:disabled:bg-gray-800"
                            rows={3}
                            placeholder="Optional reason for leave..."
                        />
                    </div>

                    {/* Existing Attachments Management */}
                    {existingAttachments.length > 0 && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Attachments</label>
                            <div className="space-y-2">
                                {existingAttachments.map((file: any, idx: number) => (
                                    <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-md">
                                        <a 
                                            href={file.fileUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="flex items-center text-sm text-indigo-600 dark:text-indigo-400 hover:underline truncate"
                                        >
                                            <Paperclip className="w-4 h-4 mr-2" />
                                            {file.originalName}
                                        </a>
                                        {!readOnly && (
                                            <button
                                                type="button"
                                                onClick={() => removeExistingAttachment(idx)}
                                                className="ml-2 p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                                                title="Remove attachment"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {!readOnly && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {existingAttachments.length > 0 ? "Add More Attachments" : "Attachments"}
                            </label>
                            <FileUpload onFilesChange={setNewAttachments} />
                        </div>
                    )}

                    <div className="pt-2 flex justify-between items-center">
                        {initialData && !readOnly ? (
                            <button 
                                type="button"
                                onClick={handleDeleteLeave}
                                className="px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center"
                            >
                                <Trash2 className="w-4 h-4 mr-1.5" />
                                Delete
                            </button>
                        ) : (
                            <div></div> // Spacer
                        )}

                        <div className="flex space-x-3">
                            <button 
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                {readOnly ? "Close" : "Cancel"}
                            </button>
                            {!readOnly && (
                                <button 
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-200 dark:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? "Saving..." : "Save Leave"}
                                </button>
                            )}
                        </div>
                    </div>
                </form>
                </div>
            </div>
        </div>
    );
}
