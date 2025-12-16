import { useState, useRef } from "react";
import { Paperclip, X, File, AlertCircle } from "lucide-react";
import { api } from "../../api/client";

interface UploadedFile {
    fileKey: string;
    originalName: string;
    mimeType: string;
    fileUrl: string;
}

export default function FileUpload({ onFilesChange }: { onFilesChange: (files: UploadedFile[]) => void }) {
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        
        const files = Array.from(e.target.files);
        setUploading(true);
        
        try {
            const newUploadedFiles: UploadedFile[] = [];

            for (const file of files) {
                // Upload each file
                const { data, error }: any = await (api.uploads as any).index.post({
                    file: file,
                    folder: "attachments"
                });

                if (error) {
                    console.error("Upload error", error);
                    alert(`Failed to upload ${file.name}`);
                    continue;
                }

                if (data) {
                    newUploadedFiles.push({
                        fileKey: data.key,
                        originalName: file.name,
                        mimeType: file.type,
                        fileUrl: data.url
                    });
                }
            }

            const updatedList = [...uploadedFiles, ...newUploadedFiles];
            setUploadedFiles(updatedList);
            onFilesChange(updatedList);

        } catch (err) {
            console.error("Upload process failed", err);
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const removeFile = (index: number) => {
        const updated = uploadedFiles.filter((_, i) => i !== index);
        setUploadedFiles(updated);
        onFilesChange(updated);
    };

    return (
        <div>
            <div className="flex flex-wrap gap-2 mb-2">
                {uploadedFiles.map((file, idx) => (
                    <div key={idx} className="flex items-center p-2 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600 text-sm">
                        <File className="w-4 h-4 mr-2 text-indigo-500" />
                        <span className="truncate max-w-[150px] text-gray-700 dark:text-gray-300" title={file.originalName}>
                            {file.originalName}
                        </span>
                        <button 
                            type="button" 
                            onClick={() => removeFile(idx)} 
                            className="ml-2 text-gray-400 hover:text-red-500"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>

            <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium disabled:opacity-50"
            >
                <Paperclip className="w-4 h-4 mr-1" />
                {uploading ? "Uploading..." : "Attach files"}
            </button>
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                className="hidden" 
                multiple
            />
        </div>
    );
}
