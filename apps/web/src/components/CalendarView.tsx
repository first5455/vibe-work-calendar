import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, format, isSameMonth, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { cn } from "../lib/utils";
import { api } from "../api/client";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

export default function CalendarView({ refreshTrigger = 0, onEditLeave, filter = { type: 'MINE' } }: { refreshTrigger?: number, onEditLeave?: (leave: any) => void, filter?: { type: 'MINE' | 'TEAM', teamId?: string } }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [leaves, setLeaves] = useState<any[]>([]);
  const [selectedLeave, setSelectedLeave] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

// ... existing code ...


  useEffect(() => {
    const fetchLeaves = async () => {
        try {
             let fetchedLeaves: any[] = [];
             
             if (filter.type === 'MINE') {
                 const { data } = await (api.leaves as any).mine.get();
                 fetchedLeaves = data || [];
             } else if (filter.type === 'TEAM' && filter.teamId) {
                 console.log("Fetching team leaves for", filter.teamId);
                 const { data, error } = await (api.leaves as any).team({ teamId: filter.teamId }).get();
                 if (error) console.error("Team leaves fetch error", error);
                 console.log("Team leaves data", data);
                 fetchedLeaves = data || [];
             }

             if (fetchedLeaves) {
                 console.log(`Fetched ${fetchedLeaves.length} leaves`);
                 setLeaves(fetchedLeaves.map((l: any) => ({
                     ...l,
                     startDate: new Date(l.startDate),
                     endDate: new Date(l.endDate),
                     // Ensure user object exists if not provided
                     user: l.user || { displayName: 'Unknown' } 
                 })).filter((l: any) => !isNaN(l.startDate.getTime()) && !isNaN(l.endDate.getTime())));
             }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    setLoading(true);
    fetchLeaves();
  }, [currentDate, refreshTrigger, filter]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const allDaysInMonthView: Date[] = [];
  let day = startDate;
  while (day <= endDate) {
      allDaysInMonthView.push(day);
      day = new Date(day.setDate(day.getDate() + 1));
  }

  const prevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="flex space-x-2">
            <button 
                onClick={prevMonth}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-600 dark:text-gray-300"
            >
                ←
            </button>
            <button 
                onClick={nextMonth}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-600 dark:text-gray-300"
            >
                →
            </button>
        </div>
      </div>

      {loading && <div className="p-4 text-center text-gray-500">Loading...</div>}
      {!loading && leaves.length === 0 && <div className="p-4 text-center text-gray-500">No leaves found for this selection.</div>}

      <div className="grid grid-cols-7 border-b border-gray-100 dark:border-gray-700">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(dayName => (
            <div key={dayName} className="p-4 text-sm font-semibold text-gray-500 dark:text-gray-400">
                {dayName}
            </div>
        ))}
      </div>

      <div className="grid grid-cols-7 auto-rows-[120px]">
        {allDaysInMonthView.map((dayItem, i) => (
            <div 
                key={i} 
                className={cn(
                    "p-2 border-b border-r border-gray-100 dark:border-gray-700 relative hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors",
                    !isSameMonth(dayItem, currentDate) && "bg-gray-50/50 dark:bg-gray-900/50"
                )}
            >
                <div className={cn(
                    "text-sm mb-1 font-medium w-7 h-7 flex items-center justify-center rounded-full",
                    isSameMonth(dayItem, new Date()) && dayItem.getDate() === new Date().getDate() && dayItem.getMonth() === new Date().getMonth() && dayItem.getFullYear() === new Date().getFullYear()
                        ? "bg-indigo-600 text-white" 
                        : "text-gray-700 dark:text-gray-300"
                )}>
                    {dayItem.getDate()}
                </div>
                
                <div className="space-y-1 overflow-y-auto max-h-[80px] hide-scrollbar">
                    {leaves
                        .filter(leave => isWithinInterval(dayItem, { start: startOfDay(leave.startDate), end: endOfDay(leave.endDate) }))
                        .map((leave, idx) => (
                            <div 
                                key={`${leave.id}-${idx}`}
                                onClick={(e) => { e.stopPropagation(); setSelectedLeave(leave); }}
                                className={cn(
                                    "text-xs p-1 rounded cursor-pointer truncate transition-opacity hover:opacity-80 flex items-center",
                                    leave.type === 'SICK' ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" :
                                    leave.type === 'VACATION' ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" : 
                                    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                                )}
                                title={`${leave.user?.displayName || 'Unknown'} - ${leave.type}: ${leave.reason}`}
                            >
                               {leave.user?.displayName || 'Unknown'}
                            </div>
                        ))}
                </div>
            </div>
        ))}
      </div>

      {/* Leave Detail Modal/Popover */}
      {selectedLeave && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setSelectedLeave(null)}>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 p-6 w-full max-w-sm animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                  <div className="flex justify-between items-start mb-4">
                      <h4 className="font-bold text-lg text-gray-900 dark:text-white">Leave Details</h4>
                      <button onClick={() => setSelectedLeave(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><X className="w-5 h-5" /></button>
                  </div>
                  <div className="space-y-3 text-sm">
                      <div>
                          <span className="text-gray-500 dark:text-gray-400 block mb-1">Team Member</span>
                          <div className="flex items-center">
                              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold mr-2 overflow-hidden">
                                  {selectedLeave.user.avatarUrl ? (
                                      <img src={selectedLeave.user.avatarUrl} alt={selectedLeave.user.displayName} className="w-full h-full object-cover" />
                                  ) : (
                                      selectedLeave.user.displayName.charAt(0)
                                  )}
                              </div>
                              <span className="text-gray-900 dark:text-white font-medium">{selectedLeave.user.displayName}</span>
                          </div>
                      </div>
                      <div>
                          <span className="text-gray-500 dark:text-gray-400">Type:</span> 
                          <span className={cn(
                              "ml-2 px-2 py-0.5 rounded text-xs font-medium",
                              selectedLeave.type === 'SICK' ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" :
                              selectedLeave.type === 'VACATION' ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                          )}>{selectedLeave.type}</span>
                      </div>
                      <div>
                          <span className="text-gray-500 dark:text-gray-400">Dates:</span>
                          <div className="text-gray-900 dark:text-white font-medium mt-1">
                              {format(selectedLeave.startDate, 'MMM d, yyyy')} - {format(selectedLeave.endDate, 'MMM d, yyyy')}
                          </div>
                      </div>
                      {selectedLeave.reason && (
                          <div>
                              <span className="text-gray-500 dark:text-gray-400">Reason:</span>
                              <p className="text-gray-900 dark:text-white mt-1 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md">{selectedLeave.reason}</p>
                          </div>
                      )}

                      {/* Edit Button */}
                      {onEditLeave && (filter.type === 'MINE' || (user && user.id === selectedLeave.userId)) && (
                          <div className="pt-4 mt-2 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                              <button 
                                onClick={(e) => { 
                                    e.stopPropagation(); 
                                    onEditLeave(selectedLeave); 
                                    setSelectedLeave(null); 
                                }}
                                className="px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors shadow-sm"
                              >
                                  Edit Request
                              </button>
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}
