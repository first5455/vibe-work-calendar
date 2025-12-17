import { useState, useEffect } from "react";
import CalendarView from "../../components/CalendarView";
import AllLeavesList from "./components/AllLeavesList";
import LeaveRequestModal from "../request/LeaveRequestModal";
import { useAuth } from "../../hooks/useAuth";
import { Plus } from "lucide-react";
import { api } from "../../api/client";
import { ErrorBoundary } from "../../components/ErrorBoundary";
import { useWebSocket } from "../../context/WebSocketContext";

export default function DashboardPage() {
    const { user } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { lastMessage } = useWebSocket();
    const [stats, setStats] = useState({ upcomingLeaves: 0, teamMembersOnLeave: 0, totalLeavesThisMonth: 0 });
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [editLeave, setEditLeave] = useState<any>(null);
    const [teams, setTeams] = useState<any[]>([]);
    const [filter, setFilter] = useState<{ type: 'MINE' | 'TEAM' | 'ALL', teamId?: string }>({ type: 'MINE' });

    useEffect(() => {
        const fetchModels = async () => {
            try {
                const { data } = await (api.teams as any).get();
                if (data) setTeams(data);
                
                const { data: statsData } = await (api.leaves as any).stats.get();
                if (statsData) setStats(statsData);
            } catch (e) {
                console.error(e);
            }
        };
        fetchModels();
    }, []);

    useEffect(() => {
        if (lastMessage) {
            setRefreshTrigger(prev => prev + 1);
        }
    }, [lastMessage]);

    const handleEditLeave = (leave: any) => {
        setEditLeave(leave);
        setIsModalOpen(true);
    };

    const handleSuccess = () => {
        setRefreshTrigger(prev => prev + 1);
        setEditLeave(null);
    };

    return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
            <select 
                className="w-full md:w-auto px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                value={filter.type === 'MINE' ? 'MINE' : filter.type === 'ALL' ? 'ALL' : filter.teamId}
                onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'MINE') setFilter({ type: 'MINE' });
                    else if (val === 'ALL') setFilter({ type: 'ALL' });
                    else setFilter({ type: 'TEAM', teamId: val });
                }}
            >
                <option value="MINE" className="dark:bg-gray-800">My Leaves</option>
                <option value="ALL" className="dark:bg-gray-800">All Leaves</option>
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
            Save Leave
          </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-transparent dark:border-gray-700">
             <h3 className="font-medium text-gray-500 dark:text-gray-400">Upcoming My Leaves</h3>
             <p className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">{stats.upcomingLeaves}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-transparent dark:border-gray-700">
             <h3 className="font-medium text-gray-500 dark:text-gray-400">Total Leaves of this month</h3>
             <p className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">{(stats as any).totalLeavesThisMonth || 0}</p>
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

      <div className="mt-8">
          <AllLeavesList refreshTrigger={refreshTrigger} onEditLeave={handleEditLeave} />
      </div>

      <LeaveRequestModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditLeave(null); }} 
        initialData={editLeave}
        onSuccess={handleSuccess}
        readOnly={editLeave && user?.id !== editLeave.userId}
      />
    </div>
  );
}
