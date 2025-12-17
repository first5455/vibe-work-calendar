import { useState, useEffect } from "react";
import CalendarView from "../../components/CalendarView";
import LeaveRequestModal from "../request/LeaveRequestModal";
import { Plus } from "lucide-react";
import { api } from "../../api/client";
import { ErrorBoundary } from "../../components/ErrorBoundary";

export default function DashboardPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [stats, setStats] = useState({ upcomingLeaves: 0, teamMembersOnLeave: 0 });

    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [editLeave, setEditLeave] = useState<any>(null);
    const [teams, setTeams] = useState<any[]>([]);
    const [filter, setFilter] = useState<{ type: 'MINE' | 'TEAM', teamId?: string }>({ type: 'MINE' });

    const handleSuccess = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    const handleEditLeave = (leave: any) => {
        setEditLeave(leave);
        setIsModalOpen(true);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch stats
                const { data: statsData } = await (api.leaves as any).stats.get();
                if (statsData) setStats(statsData);

                // Fetch teams for filter
                const { data: teamsData } = await (api.teams as any).index.get();
                if (teamsData) setTeams(teamsData);
            } catch (e) {
                console.error("Failed to fetch dashboard data", e);
            }
        };
        fetchData();
    }, [refreshTrigger]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
            <select 
                className="w-full md:w-auto px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                value={filter.type === 'MINE' ? 'MINE' : filter.teamId}
                onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'MINE') setFilter({ type: 'MINE' });
                    else setFilter({ type: 'TEAM', teamId: val });
                }}
            >
                <option value="MINE" className="dark:bg-gray-800">My Leaves</option>
                <optgroup label="Teams" className="dark:bg-gray-800">
                    {teams.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                </optgroup>
            </select>
          </div>
          <button 
            onClick={() => { setEditLeave(null); setIsModalOpen(true); }}
            className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-all font-medium w-full md:w-auto"
          >
            <Plus className="w-5 h-5 mr-2" />
            Request Leave
          </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-transparent dark:border-gray-700">
             <h3 className="font-medium text-gray-500 dark:text-gray-400">Upcoming Leaves</h3>
             <p className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">{stats.upcomingLeaves}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-transparent dark:border-gray-700">
             <h3 className="font-medium text-gray-500 dark:text-gray-400">Team Members On Leave</h3>
             <p className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">{stats.teamMembersOnLeave}</p>
          </div>
      </div>

      <div className="mt-8">
          <ErrorBoundary>
              <CalendarView refreshTrigger={refreshTrigger} onEditLeave={handleEditLeave} filter={filter} />
          </ErrorBoundary>
      </div>

      <LeaveRequestModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditLeave(null); }} 
        initialData={editLeave}
        onSuccess={handleSuccess}
      />
    </div>
  )
}
