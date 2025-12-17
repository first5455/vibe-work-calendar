import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import { Calendar, ArrowRight, Trash2, Paperclip, ArrowLeft, User, Shield, Crown, UserPlus, MoreVertical, Repeat } from "lucide-react";
import LeaveRequestModal from "../request/LeaveRequestModal";
import AddMemberModal from "./AddMemberModal";
import { useAuth } from "../../hooks/useAuth";
import AvatarUpload from "../../components/upload/AvatarUpload";

export default function TeamDetailPage() {
    const { teamId } = useParams();
    const navigate = useNavigate();
    const [team, setTeam] = useState<any>(null);
    const [leaves, setLeaves] = useState<any[]>([]);
    const [members, setMembers] = useState<any[]>([]);
    const { user } = useAuth();

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
        (api.teams as any)({ id: teamId }).members.get().then(({ data, error }: any) => {
            if (error) console.error("Failed to fetch members", error);
            if (data) {
                setMembers(data);
            }
        });

    }, [teamId]);


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

    const handleDeleteTeam = async () => {
        if (!team) return;
        if (!confirm(`Are you sure you want to delete team "${team.name}"? This action cannot be undone and will delete all members and leaves associated with this team.`)) return;
        
        const confirmName = prompt(`Please type "${team.name}" to confirm deletion.`);
        if (confirmName !== team.name) {
            if (confirmName !== null) alert("Team name does not match.");
            return;
        }

        try {
            const { error }: any = await (api.teams as any)({ id: teamId }).delete();
            if (error) throw error;
            navigate("/team");
        } catch (e) {
            console.error("Failed to delete team", e);
            alert("Failed to delete team: " + (e as Error).message);
        }
    };

    const [editLeave, setEditLeave] = useState<any>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    const handleAction = async (action: string, member: any, payload?: any) => {
        setOpenMenuId(null);
        try {
            if (action === "REMOVE") {
                if (!confirm(`Are you sure you want to remove ${member.name}?`)) return;
                const { error } = await (api.teams as any)({ id: teamId || "" }).members({ userId: member.id }).delete();
                if (error) throw error;
                setMembers(members.filter(m => m.id !== member.id));
            } else if (action === "CHANGE_ROLE") {
                const { error } = await (api.teams as any)({ id: teamId || "" }).members({ userId: member.id }).patch({ role: payload });
                if (error) throw error;
                // Update local state
                setMembers(members.map(m => m.id === member.id ? { ...m, role: payload } : m));
            } else if (action === "TRANSFER_OWNER") {
                const promptText = `Type "TRANSFER" to confirm transferring ownership to ${member.name}. You will lose your Owner status.`;
                if (prompt(promptText) !== "TRANSFER") return;
                
                const { error } = await (api.teams as any)({ id: teamId || "" }).transfer.post({ newOwnerId: member.id });
                if (error) throw error;
                window.location.reload();
            }
        } catch (e) {
            console.error("Action failed", e);
            alert("Action failed: " + (e as Error).message);
        }
    };

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
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                    {isOwnerOrAdmin ? (
                        <AvatarUpload 
                            currentAvatarUrl={team.logoUrl}
                            onAvatarUpdate={(url) => setTeam({ ...team, logoUrl: url })}
                            onSave={async (url) => {
                                const { error } = await (api.teams as any)({ id: teamId }).patch({ logoUrl: url });
                                if (error) throw error;
                            }}
                            className="w-16 h-16"
                        />
                    ) : (
                        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 overflow-hidden font-bold border-2 border-gray-200 dark:border-gray-700">
                             {team.logoUrl ? (
                                <img src={team.logoUrl} alt={team.name} className="w-full h-full object-cover" />
                             ) : (
                                <span className="text-2xl">{team.name.charAt(0)}</span>
                             )}
                        </div>
                    )}
                    
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{team.name}</h1>
                        <p className="text-gray-500 dark:text-gray-400">{team.memberCount} members</p>
                    </div>
                    </div>
                     {team.role === 'OWNER' && (
                        <button 
                            onClick={handleDeleteTeam}
                            className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 rounded-lg transition-colors border border-red-200 dark:border-red-800 ml-4"
                        >
                            <Trash2 className="w-4 h-4 inline-block mr-2" />
                            Delete Team
                        </button>
                     )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Members Section */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 h-fit">
                    <div className="px-6 py-4 border-b border-gray-50 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 flex justify-between items-center rounded-t-xl">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Team Members</h3>
                        {isOwnerOrAdmin && (
                            <button 
                                onClick={() => setIsAddMemberModalOpen(true)}
                                className="p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                                title="Add Member"
                            >
                                <UserPlus className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    <div className="divide-y divide-gray-50 dark:divide-gray-700">
                        {members.map((member) => (
                            <div key={member.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 overflow-hidden">
                                    {member.avatarUrl ? (
                                        <img src={member.avatarUrl} alt={member.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                    ) : (
                                        <span className="font-medium">{member.name.charAt(0)}</span>
                                    )}
                                    </div>
                                    <div className="text-left">
                                        <p className="font-medium text-gray-900 dark:text-white">{member.name}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{member.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    {member.role === 'OWNER' ? (
                                        <span className="flex items-center px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-medium rounded-full"><Crown className="w-3 h-3 mr-1" /> Owner</span>
                                    ) : member.role === 'ADMIN' ? (
                                        <span className="flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium rounded-full"><Shield className="w-3 h-3 mr-1" /> Admin</span>
                                    ) : (
                                        <span className="flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-full"><User className="w-3 h-3 mr-1" /> Member</span>
                                    )}

                                    {/* Action Menu */}
                                    {(isOwnerOrAdmin) && member.role !== 'OWNER' && (
                                        <div className="relative">
                                            <button 
                                                onClick={() => setOpenMenuId(openMenuId === member.id ? null : member.id)}
                                                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                                            >
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                            
                                            {openMenuId === member.id && (
                                                <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 py-1 z-10">
                                                    {/* Role Management */}
                                                    {team.role === 'OWNER' && (
                                                        <>
                                                            <button 
                                                                onClick={() => handleAction("CHANGE_ROLE", member, member.role === 'ADMIN' ? 'MEMBER' : 'ADMIN')}
                                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center"
                                                            >
                                                                {member.role === 'ADMIN' ? (
                                                                    <><User className="w-4 h-4 mr-2" /> Demote to Member</>
                                                                ) : (
                                                                    <><Shield className="w-4 h-4 mr-2" /> Promote to Admin</>
                                                                )}
                                                            </button>
                                                            <button 
                                                                onClick={() => handleAction("TRANSFER_OWNER", member)}
                                                                className="w-full text-left px-4 py-2 text-sm text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 flex items-center"
                                                            >
                                                                <Repeat className="w-4 h-4 mr-2" /> Transfer Ownership
                                                            </button>
                                                            <div className="h-px bg-gray-100 dark:bg-gray-700 my-1" />
                                                        </>
                                                    )}
                                                    
                                                    {/* Remove Member */}
                                                    {((team.role === 'OWNER') || (team.role === 'ADMIN' && member.role === 'MEMBER')) && (
                                                        <button 
                                                            onClick={() => handleAction("REMOVE", member)}
                                                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center"
                                                        >
                                                            <Trash2 className="w-4 h-4 mr-2" /> Remove Member
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Leave Requests Section */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden h-fit">
                    <div className="px-6 py-4 border-b border-gray-50 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 flex justify-between items-center">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Leave List</h3>
                    </div>
                    {leaves.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 dark:text-gray-400">No leave requests found.</div>
                    ) : (
                        <div className="divide-y divide-gray-50 dark:divide-gray-700">
                            {leaves.map((leave) => (
                                <div key={leave.id} className="p-4 hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors border-l-4 border-transparent hover:border-indigo-500">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-sm overflow-hidden border border-gray-200 dark:border-gray-600">
                                                {leave.user?.avatarUrl ? (
                                                    <img src={leave.user.avatarUrl} alt={leave.user.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                                ) : (
                                                    <span className="font-bold text-gray-500">{leave.user?.displayName?.charAt(0)}</span>
                                                )}
                                            </div>
                                            <div>
                                                <div className="flex flex-col">
                                                     <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Requested by</span>
                                                     <div className="flex items-center space-x-2">
                                                        <span className="text-base font-bold text-gray-900 dark:text-white">
                                                            {leave.user?.displayName}
                                                        </span>
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                                                            leave.type === 'SICK' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                                                            leave.type === 'VACATION' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 
                                                            'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                                        }`}>
                                                            {leave.type}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-14">
                                        <div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider mb-1">
                                                Dates
                                            </div>
                                            <div className="flex items-center text-sm text-gray-900 dark:text-gray-200 font-medium bg-white dark:bg-gray-800 px-3 py-2 rounded-md border border-gray-100 dark:border-gray-600 shadow-sm">
                                                <Calendar className="w-4 h-4 mr-2 text-indigo-500" />
                                                {new Date(leave.startDate).toLocaleDateString()}
                                                <ArrowRight className="w-3 h-3 mx-2 text-gray-400" />
                                                {new Date(leave.endDate).toLocaleDateString()}
                                                <span className="ml-2 text-xs text-gray-500 font-normal">
                                                    ({Math.ceil((new Date(leave.endDate).getTime() - new Date(leave.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1} days)
                                                </span>
                                            </div>
                                        </div>

                                        {leave.reason && (
                                            <div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider mb-1">
                                                    Reason
                                                </div>
                                                <div className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-md border border-gray-100 dark:border-gray-700 italic">
                                                    "{leave.reason}"
                                                </div>
                                            </div>
                                        )}

                                        {leave.attachments && leave.attachments.length > 0 && (
                                            <div className="md:col-span-2">
                                                 <div className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider mb-1">
                                                    Attachments
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {leave.attachments.map((file: any, idx: number) => (
                                                        <a 
                                                            key={idx}
                                                            href={file.fileUrl} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="flex items-center px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                                                        >
                                                            <Paperclip className="w-3 h-3 mr-2" />
                                                            {file.originalName}
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex justify-end space-x-2">
                                        {(isOwnerOrAdmin || (user && user.id === leave.userId)) && ( 
                                            <button 
                                                onClick={() => handleEdit(leave)}
                                                className="px-3 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-md transition-colors"
                                            >
                                                Edit
                                            </button>
                                        )}

                                        {(isOwnerOrAdmin || (user && user.id === leave.userId)) && (
                                            <button 
                                                onClick={() => handleDelete(leave.id)}
                                                className="px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                                            >
                                                Delete
                                            </button>
                                        )}
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
                onSuccess={() => {
                    // Refresh leaves
                    (api.leaves as any).team({ teamId }).get().then(({ data }: any) => {
                        if (data) setLeaves(data);
                    });
                }}
            />

            <AddMemberModal
                isOpen={isAddMemberModalOpen}
                onClose={() => setIsAddMemberModalOpen(false)}
                teamId={teamId || ""}
                onSuccess={() => {
                    // Quick refresh of members
                    (api.teams as any)({ id: teamId }).members.get().then(({ data }: any) => {
                        if (data) setMembers(data);
                    });
                }}
            />
        </div>
    );
}
