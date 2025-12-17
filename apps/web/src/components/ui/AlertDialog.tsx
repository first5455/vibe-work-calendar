import { AlertCircle, CheckCircle, Info } from "lucide-react";
import Modal from "./Modal";
import { cn } from "../../lib/utils";

interface AlertDialogProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    type?: 'success' | 'error' | 'info';
    onConfirm?: () => void;
    confirmText?: string;
    cancelText?: string;
}

export default function AlertDialog({ 
    isOpen, 
    onClose, 
    title, 
    message, 
    type = 'info', 
    onConfirm,
    confirmText = "OK",
    cancelText = "Cancel"
}: AlertDialogProps) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="flex flex-col items-center text-center space-y-4">
                <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center",
                    type === 'success' ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" :
                    type === 'error' ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" :
                    "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                )}>
                    {type === 'success' ? <CheckCircle className="w-6 h-6" /> :
                     type === 'error' ? <AlertCircle className="w-6 h-6" /> :
                     <Info className="w-6 h-6" />}
                </div>
                
                <p className="text-gray-600 dark:text-gray-300">
                    {message}
                </p>

                <div className="flex w-full space-x-3 pt-2">
                    {onConfirm && (
                        <button 
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                            {cancelText}
                        </button>
                    )}
                    <button 
                        onClick={() => {
                            if (onConfirm) onConfirm();
                            onClose();
                        }}
                        className={cn(
                            "flex-1 px-4 py-2 text-white rounded-lg transition-colors shadow-sm",
                            type === 'error' ? "bg-red-600 hover:bg-red-700 shadow-red-200 dark:shadow-none" :
                            "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 dark:shadow-none"
                        )}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
