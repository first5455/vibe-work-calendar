import { useState, useRef, useCallback } from "react";
import Cropper from "react-easy-crop";
import { Camera, X, Upload, ZoomIn, ZoomOut } from "lucide-react";
import { api } from "../../api/client";
import AlertDialog from "../../components/ui/AlertDialog";

// Helper to create the cropped image
const createCroppedImg = async (imageSrc: string, pixelCrop: any) => {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.addEventListener('load', () => resolve(img));
      img.addEventListener('error', (err) => reject(err));
      img.src = imageSrc;
  });

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) return null;

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
  );

  return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
          if (!blob) {
              reject(new Error('Canvas is empty'));
              return;
          }
           resolve(blob);
      }, 'image/jpeg');
  });
};

export default function AvatarUpload({ 
    currentAvatarUrl, 
    onAvatarUpdate,
    onSave,
    className = "w-24 h-24"
}: { 
    currentAvatarUrl?: string, 
    onAvatarUpdate: (newUrl: string) => void,
    onSave?: (url: string) => Promise<any>,
    className?: string
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [alertInfo, setAlertInfo] = useState<{ open: boolean, title: string, message: string, type: 'error' | 'success' | 'info' }>({ 
        open: false, 
        title: "", 
        message: "", 
        type: 'info' 
    });

    const onCropComplete = useCallback((_: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const imageDataUrl = await readFile(file);
            setImageSrc(imageDataUrl as string);
            setIsOpen(true);
        }
    };

    const readFile = (file: File) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.addEventListener('load', () => resolve(reader.result), false);
            reader.readAsDataURL(file);
        });
    };

    const handleSaveImage = async () => {
        if (!imageSrc || !croppedAreaPixels) return;
        setLoading(true);
        try {
            const croppedBlob = await createCroppedImg(imageSrc, croppedAreaPixels);
            if (!croppedBlob) throw new Error("Failed to create blob");

            const formData = new FormData();
            formData.append("file", croppedBlob, "avatar.jpg");
            formData.append("folder", "avatars");

            const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
            const response = await fetch(`${API_URL}/uploads`, {
                method: "POST",
                body: formData
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Upload failed");
            }

            const data = await response.json();

            if (data) {
                if (onSave) {
                    await onSave(data.url);
                } else {
                    // Default behavior: Update user profile
                    const { error: updateError } = await (api.users as any).me.patch({ avatarUrl: data.url });
                    if (updateError) throw updateError;
                }
                
                onAvatarUpdate(data.url);
                setIsOpen(false);
                setImageSrc(null);
            }

        } catch (e) {
            console.error("Upload failed", e);
            setAlertInfo({ open: true, title: "Error", message: "Failed to upload avatar", type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className={`relative group mx-auto cursor-pointer ${className}`} onClick={() => fileInputRef.current?.click()}>
                <div className={`w-full h-full rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800`}>
                    {currentAvatarUrl ? (
                        <img 
                            src={currentAvatarUrl} 
                            alt="Avatar" 
                            className="w-full h-full object-cover" 
                            referrerPolicy="no-referrer"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Camera className="w-1/3 h-1/3" />
                        </div>
                    )}
                </div>
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-1/3 h-1/3 text-white" />
                </div>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    className="hidden" 
                    accept="image/*"
                />
            </div>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                            <h3 className="font-semibold text-gray-900 dark:text-white">Crop Profile Picture</h3>
                            <button onClick={() => setIsOpen(false)}><X className="w-5 h-5 text-gray-500" /></button>
                        </div>
                        
                        <div className="relative h-64 sm:h-80 bg-black">
                            {imageSrc && (
                                <Cropper
                                    image={imageSrc}
                                    crop={crop}
                                    zoom={zoom}
                                    aspect={1}
                                    onCropChange={setCrop}
                                    onCropComplete={onCropComplete}
                                    onZoomChange={setZoom}
                                    cropShape="round"
                                />
                            )}
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="flex items-center space-x-4">
                                <ZoomOut className="w-4 h-4 text-gray-500" />
                                <input 
                                    type="range"
                                    min={1}
                                    max={3}
                                    step={0.1}
                                    value={zoom}
                                    onChange={(e) => setZoom(Number(e.target.value))}
                                    className="w-full accent-indigo-600"
                                />
                                <ZoomIn className="w-4 h-4 text-gray-500" />
                            </div>
                            
                            <div className="flex justify-end space-x-3">
                                <button 
                                    onClick={() => setIsOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleSaveImage}
                                    disabled={loading}
                                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm flex items-center"
                                >
                                    {loading && <Upload className="w-4 h-4 mr-2 animate-spin" />}
                                    {loading ? "Uploading..." : "Save Picture"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
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
