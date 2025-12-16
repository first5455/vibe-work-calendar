import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import { ArrowLeft, User, Shield, Crown } from "lucide-react";
import LeaveRequestModal from "../request/LeaveRequestModal";

export default function TeamDetailPage() {
    const { teamId } = useParams();
    const navigate = useNavigate();
    const [team, setTeam] = useState<any>(null);
    const [leaves, setLeaves] = useState<any[]>([]);
    const [members, setMembers] = useState<any[]>([]);

    useEffect(() => {
        if (!teamId) return;
        
        // Fetch team details
        (api.teams as any).index.get().then(({ data }: any) => {
            if (data) {
                const found = data.find((t: any) => t.id === teamId);
                setTeam(found);
            }
        });

        // Fetch team leaves
        (api.leaves as any).team({ teamId }).get().then(({ data }: any) => {
            if (data) {
                setLeaves(data);
            }
        });

        // Fetch team members
        (api.teams as any)({ id: teamId }).members.get().then(({ data }: any) => {
            if (data) {
                setMembers(data);
            }
        });

    }, [teamId]);

    const handleUpdateStatus = async (id: string, status: "APPROVED" | "REJECTED") => {
        try {
            await (api.leaves as any)({ id }).status.patch({ status });
            // Refresh leaves
            setLeaves(leaves.map(l => l.id === id ? { ...l, status } : l));
        } catch (e) {
            console.error("Failed to update status", e);
            alert("Failed to update status");
        }
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

    const [editLeave, setEditLeave] = useState<any>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const handleEdit = (leave: any) => {
        setEditLeave(leave);
        setIsEditModalOpen(true);
    };

    if (!team) return <div className="p-8">Loading...</div>;

    const isOwnerOrAdmin = team.role === 'OWNER' || team.role === 'ADMIN';

    return (
        <div className="space-y-6">
            <div>
                <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back
                </button>
                <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 overflow-hidden font-bold">
                        {team.name.charAt(0)}
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{team.name}</h1>
                        <p className="text-gray-500 dark:text-gray-400">{team.memberCount} members</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Members Section */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden h-fit">
                    <div className="px-6 py-4 border-b border-gray-50 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Team Members</h3>
                    </div>
                    <div className="divide-y divide-gray-50 dark:divide-gray-700">
                        {members.map((member) => (
                            <div key={member.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 overflow-hidden">
                                    {member.avatarUrl ? (
                                        <img src={member.avatarUrl} alt={member.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="font-medium">{member.name.charAt(0)}</span>
                                    )}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">{member.name}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{member.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    {member.role === 'OWNER' ? (
                                        <span className="flex items-center px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-medium rounded-full"><Crown className="w-3 h-3 mr-1" /> Owner</span>
                                    ) : member.role === 'ADMIN' ? (
                                        <span className="flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium rounded-full"><Shield className="w-3 h-3 mr-1" /> Admin</span>
                                    ) : (
                                        <span className="flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-full"><User className="w-3 h-3 mr-1" /> Member</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Leave Requests Section */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden h-fit">
                    <div className="px-6 py-4 border-b border-gray-50 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 flex justify-between items-center">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Leave Requests</h3>
                    </div>
                    {leaves.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 dark:text-gray-400">No leave requests found.</div>
                    ) : (
                        <div className="divide-y divide-gray-50 dark:divide-gray-700">
                            {leaves.map((leave) => (
                                <div key={leave.id} className="p-4 hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                                leave.type === 'SICK' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                                                leave.type === 'VACATION' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 
                                                'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                            }`}>
                                                {leave.type}
                                            </span>
                                            <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                                leave.status === 'APPROVED' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                                                leave.status === 'REJECTED' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : 
                                                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                            }`}>
                                                {leave.status}
                                            </span>
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                                        </div>
                                    </div>
                                    
                                    {leave.reason && (
                                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">{leave.reason}</p>
                                    )}

                                    <div className="flex justify-end space-x-2">
                                        {/* Creator or Admin/Owner can Edit */}
                                        {(isOwnerOrAdmin || true) && ( 
                                            <button 
                                                onClick={() => handleEdit(leave)}
                                                className="px-3 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded border border-transparent hover:border-indigo-100 dark:hover:border-indigo-800"
                                            >
                                                Edit
                                            </button>
                                        )}

                                        {isOwnerOrAdmin && leave.status === 'PENDING' && (
                                            <>
                                                <button 
                                                    onClick={() => handleUpdateStatus(leave.id, "APPROVED")}
                                                    className="px-3 py-1 text-xs font-medium text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 rounded border border-green-200 dark:border-green-800"
                                                >
                                                    Approve
                                                </button>
                                                <button 
                                                    onClick={() => handleUpdateStatus(leave.id, "REJECTED")}
                                                    className="px-3 py-1 text-xs font-medium text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded border border-red-200 dark:border-red-800"
                                                >
                                                    Reject
                                                </button>
                                            </>
                                        )}
                                        <button 
                                            onClick={() => handleDelete(leave.id)}
                                            className="px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-red-700 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <LeaveRequestModal 
                isOpen={isEditModalOpen} 
                onClose={() => { setIsEditModalOpen(false); setEditLeave(null); }} 
                initialData={editLeave}
            />
        </div>
    );
}
