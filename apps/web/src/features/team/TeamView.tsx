import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, User, Shield, Crown } from "lucide-react";
import { api } from "../../api/client";

export default function TeamView() {
  const [teams, setTeams] = useState<any[]>([]);
  // const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeams = async () => {
        try {
            // Eden Treaty type workaround: treating teams as any to access index or get
            const { data, error } = await (api.teams as any).index.get();
            if (error) throw error;
            if (data) {
                // Transform data if necessary or use directly if matches interface
                setTeams(data.map((t: any) => ({
                    id: t.id,
                    name: t.name,
                    logoUrl: t.logoUrl,
                    role: t.role,
                    memberCount: t.memberCount,
                    members: t.members
                })));
            }
        } catch (err) {
            console.error("Failed to fetch teams", err);
        }
    }
    fetchTeams();
  }, []);

  const handleCreateTeam = async () => {
      const name = window.prompt("Enter team name:");
      if (!name) return;
      
      try {
          const { error } = await (api.teams as any).index.post({
              name,
              slug: name.toLowerCase().replace(/\s+/g, '-')
          });
          if (error) throw error;
          // Refresh teams
          window.location.reload(); 
      } catch (e) {
          console.error("Failed to create team", e);
          alert("Failed to create team");
      }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
           <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Teams</h2>
           <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your workspaces and members</p>
        </div>
        <button 
            onClick={handleCreateTeam}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-all"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Team
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.length === 0 ? (
           <div className="col-span-full py-16 flex flex-col items-center justify-center text-center bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
               <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mb-4">
                   <User className="w-8 h-8 text-indigo-500 dark:text-indigo-400" />
               </div>
               <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Teams Yet</h3>
               <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-6">
                   Get started by creating your first team to manage members and track leave requests.
               </p>
               <button 
                onClick={handleCreateTeam}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-all font-medium"
               >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Team
               </button>
           </div>
        ) : (
            teams.map((team) => (
          <div key={team.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow p-6 group">
             <div className="flex items-start justify-between">
                 <div className="flex items-center space-x-3">
                     <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-semibold text-lg overflow-hidden">
                         {team.logoUrl ? (
                             <img src={team.logoUrl} alt={team.name} className="w-full h-full object-cover" />
                         ) : (
                             team.name.charAt(0)
                         )}
                     </div>
                     <div>
                         <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{team.name}</h3>
                         <span className="text-xs text-gray-500 dark:text-gray-400">{team.memberCount} members</span>
                     </div>
                 </div>
                 <Badge role={team.role} />
             </div>
             
             <div className="mt-6 pt-6 border-t border-gray-50 dark:border-gray-700 flex items-center justify-between text-sm">
                 <div className="flex -space-x-2">
                     {team.members && team.members.map((member: any) => (
                         <div key={member.id} className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs text-gray-500 dark:text-gray-400 overflow-hidden" title={member.displayName}>
                             {member.avatarUrl ? (
                                 <img src={member.avatarUrl} alt={member.displayName} className="w-full h-full object-cover" />
                             ) : (
                                 <span className="font-medium text-gray-600 dark:text-gray-300">{member.displayName.charAt(0).toUpperCase()}</span>
                             )}
                         </div>
                     ))}
                     {team.memberCount > 3 && (
                         <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-300">
                             +{team.memberCount - 3}
                         </div>
                     )}
                 </div>
                  <Link to={`/team/${team.id}`} className="text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors">
                      View Details
                  </Link>
             </div>
          </div>
        )))}
      </div>
    </div>
  );
}

function Badge({ role }: { role: string }) {
    if (role === 'OWNER') {
        return <span className="flex items-center px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-medium rounded-full"><Crown className="w-3 h-3 mr-1" /> Owner</span>
    }
    if (role === 'ADMIN') {
        return <span className="flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium rounded-full"><Shield className="w-3 h-3 mr-1" /> Admin</span>
    }
    return <span className="flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-full"><User className="w-3 h-3 mr-1" /> Member</span>
}
