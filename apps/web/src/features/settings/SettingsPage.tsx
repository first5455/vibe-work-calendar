import { useState, useEffect } from "react";
import { api } from "../../api/client";
import AvatarUpload from "../../components/upload/AvatarUpload";
import AlertDialog from "../../components/ui/AlertDialog";

export default function SettingsPage() {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        displayName: "",
        email: "", // Read only
        avatarUrl: ""
    });

    const [alertInfo, setAlertInfo] = useState<{ open: boolean, title: string, message: string, type: 'error' | 'success' | 'info' }>({ 
        open: false, 
        title: "", 
        message: "", 
        type: 'info' 
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await (api.users as any).me.get();
                if (data) {
                    setFormData({
                        displayName: data.displayName,
                        email: data.email,
                        avatarUrl: data.avatarUrl
                    });
                }
            } catch (e) {
                console.error("Failed to fetch profile", e);
            }
        };
        fetchProfile();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error }: any = await (api.users as any).me.patch({ displayName: formData.displayName });
            if (error) throw error;
            setAlertInfo({ open: true, title: "Success", message: "Profile updated successfully", type: 'success' });
        } catch (e) {
            console.error("Failed to update profile", e);
            setAlertInfo({ open: true, title: "Error", message: "Failed to update profile", type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Profile</h3>
                
                <div className="mb-8 flex justify-center">
                    <AvatarUpload 
                        currentAvatarUrl={formData.avatarUrl} 
                        onAvatarUpdate={(newUrl) => setFormData(prev => ({ ...prev, avatarUrl: newUrl }))} 
                    />
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Display Name</label>
                        <input 
                            type="text"
                            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                            value={formData.displayName}
                            onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                        <input 
                            type="email"
                            className="mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-500 dark:text-gray-400 cursor-not-allowed sm:text-sm"
                            value={formData.email}
                            disabled
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Email cannot be changed.</p>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button 
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            {loading ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
            <AlertDialog 
                isOpen={alertInfo.open} 
                onClose={() => setAlertInfo(prev => ({ ...prev, open: false }))}
                title={alertInfo.title}
                message={alertInfo.message}
                type={alertInfo.type}
            />
        </div>
    );
}
