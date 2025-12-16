import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { Calendar, ArrowRight, Paperclip } from "lucide-react";
import LeaveRequestModal from "../request/LeaveRequestModal";
// import { useAuth } from "../../hooks/useAuth";

export default function PersonalPage() {
    const [leaves, setLeaves] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    // const { user } = useAuth(); // Unused
    const [editLeave, setEditLeave] = useState<any>(null);

    useEffect(() => {
        loadLeaves();
    }, []);

    const loadLeaves = () => {
        (api.leaves as any).mine.get().then(({ data }: any) => {
            if (data) {
                setLeaves(data);
            }
        });
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this leave request?")) return;
        try {
            await (api.leaves as any)({ id }).delete();
            setLeaves(leaves.filter(l => l.id !== id));
        } catch (e) {
            console.error("Failed to delete", e);
            alert("Failed to delete");
        }
    };

    const handleEdit = (leave: any) => {
        setEditLeave(leave);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Leaves</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage your personal and team leave requests</p>
                </div>
                <button 
                    onClick={() => { setEditLeave(null); setIsModalOpen(true); }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center shadow-lg shadow-indigo-500/20"
                >
                    <Calendar className="w-4 h-4 mr-2" />
                    Request Leave
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Leave History</h3>
                </div>
                
                {leaves.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Calendar className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No Status Yet</h3>
                        <p className="text-gray-500 dark:text-gray-400">You haven't requested any leave yet.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50 dark:divide-gray-700">
                        {leaves.map((leave) => (
                            <div key={leave.id} className="p-6 hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center space-x-4">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                            leave.type === 'SICK' ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400' :
                                            leave.type === 'VACATION' ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 
                                            'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                                        }`}>
                                            {leave.type === 'SICK' ? '🤒' : leave.type === 'VACATION' ? '🏖️' : '🏠'}
                                        </div>
                                        <div>
                                            <div className="flex items-center space-x-2">
                                                <span className="font-semibold text-gray-900 dark:text-white text-lg">
                                                    {leave.type.charAt(0) + leave.type.slice(1).toLowerCase()}
                                                </span>
                                                {!leave.teamId && (
                                                    <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-medium">
                                                        Personal
                                                    </span>
                                                )}
                                                {leave.teamId && (
                                                    <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-xs font-medium">
                                                        Team Project
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center mt-1 text-sm text-gray-500 dark:text-gray-400">
                                                <span>{new Date(leave.startDate).toLocaleDateString()}</span>
                                                <ArrowRight className="w-3 h-3 mx-2" />
                                                <span>{new Date(leave.endDate).toLocaleDateString()}</span>
                                                <span className="mx-2">•</span>
                                                <span>{Math.ceil((new Date(leave.endDate).getTime() - new Date(leave.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1} days</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center space-x-2">
                                         <button 
                                            onClick={() => handleEdit(leave)}
                                            className="px-3 py-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-md transition-colors"
                                        >
                                            Edit
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(leave.id)}
                                            className="px-3 py-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>

                                {(leave.reason || (leave.attachments && leave.attachments.length > 0)) && (
                                    <div className="mt-4 ml-16 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-100 dark:border-gray-700">
                                        {leave.reason && (
                                            <p className="text-gray-700 dark:text-gray-300 italic mb-3">"{leave.reason}"</p>
                                        )}
                                        {leave.attachments && leave.attachments.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {leave.attachments.map((file: any, idx: number) => (
                                                    <a 
                                                        key={idx}
                                                        href={file.fileUrl} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="flex items-center px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                                                    >
                                                        <Paperclip className="w-3 h-3 mr-2" />
                                                        {file.originalName}
                                                    </a>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <LeaveRequestModal 
                isOpen={isModalOpen} 
                onClose={() => { setIsModalOpen(false); setEditLeave(null); }} 
                onSuccess={loadLeaves}
                initialData={editLeave}
            />
        </div>
    );
}
