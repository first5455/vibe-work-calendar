import { useState, useEffect } from "react";
import { api } from "../../../api/client";
import { format } from "date-fns";
import { User, Calendar } from "lucide-react";

interface AllLeavesListProps {
    refreshTrigger?: number;
}

export default function AllLeavesList({ refreshTrigger = 0 }: AllLeavesListProps) {
    const [leaves, setLeaves] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaves = async () => {
            try {
                // Using 'any' cast to bypass potential type sync issues during dev
                const { data } = await (api.leaves as any).all.get();
                if (data) {
                    setLeaves(data);
                }
            } catch (error) {
                console.error("Failed to fetch all leaves", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaves();
    }, [refreshTrigger]);

    if (loading) {
        return <div className="animate-pulse h-48 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>;
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-indigo-500" />
                    All Leaves
                </h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400">
                        <tr>
                            <th className="px-4 py-3 font-medium">User</th>
                            <th className="px-4 py-3 font-medium">Type</th>
                            <th className="px-4 py-3 font-medium">Duration</th>
                            <th className="px-4 py-3 font-medium">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {leaves.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                    No leaves found
                                </td>
                            </tr>
                        ) : (
                            leaves.map((leave) => (
                                <tr key={leave.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                                                {leave.user?.avatarUrl ? (
                                                    <img src={leave.user.avatarUrl} alt={leave.user.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                                ) : (
                                                    <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                                )}
                                            </div>
                                            <span className="font-medium text-gray-900 dark:text-white">{leave.user?.displayName || 'Unknown'}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                            leave.type === 'SICK' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                            leave.type === 'VACATION' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                            'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                        }`}>
                                            {leave.type}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                                        {format(new Date(leave.startDate), 'MMM d, yyyy')} - {format(new Date(leave.endDate), 'MMM d, yyyy')}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                            Approved
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
