import React, { useState } from 'react';
import { Upload, X, CheckCircle, Loader2, AlertCircle, Image, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface UploadedFile {
  fileId: string;
  fileName: string;
  mimeType: string;
  webViewLink?: string;
  size?: number;
}

interface MediaUploadProps {
  onPhotosUpload: (files: UploadedFile[]) => void;
  onVideosUpload: (files: UploadedFile[]) => void;
  maxFiles?: number;
}

const MediaSection: React.FC<{
  title: string;
  icon: React.ReactNode;
  type: 'photo' | 'video';
  uploadedFiles: UploadedFile[];
  isUploading: boolean;
  error: string | null;
  onDrop: (e: React.DragEvent) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: (fileId: string) => void;
  onErrorClear: () => void;
  maxFiles: number;
}> = ({
  title,
  icon,
  type,
  uploadedFiles,
  isUploading,
  error,
  onDrop,
  onFileChange,
  onRemove,
  onErrorClear,
  maxFiles,
}) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    onDrop(e);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="font-semibold text-slate-900">{title}</h3>
        <span className="text-xs text-slate-500">({uploadedFiles.length}/{maxFiles})</span>
      </div>

      {/* Upload Zone */}
      {uploadedFiles.length < maxFiles && (
        <motion.div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer ${
            dragActive
              ? 'border-indigo-500 bg-indigo-50'
              : 'border-slate-200 bg-slate-50 hover:border-slate-300'
          }`}
        >
          <input
            type="file"
            multiple
            onChange={onFileChange}
            className="absolute inset-0 opacity-0 cursor-pointer"
            accept={type === 'photo' ? 'image/jpeg,image/png,image/gif' : 'video/mp4,video/quicktime'}
            disabled={isUploading || uploadedFiles.length >= maxFiles}
          />
          <div className="pointer-events-none">
            {isUploading ? (
              <>
                <Loader2 className="w-6 h-6 mx-auto text-indigo-600 animate-spin" />
                <p className="text-xs font-semibold text-slate-600 mt-1">Enviando...</p>
              </>
            ) : (
              <>
                <Upload className="w-6 h-6 mx-auto text-indigo-500 mb-1" />
                <p className="text-xs font-semibold text-slate-900">Arraste ou clique</p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {type === 'photo' ? 'Fotos (JPG, PNG, GIF)' : 'Vídeos (MP4, MOV)'}
                </p>
              </>
            )}
          </div>
        </motion.div>
      )}

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 p-2 bg-red-50 text-red-700 rounded text-xs border border-red-200"
          >
            <AlertCircle size={14} />
            {error}
            <button onClick={onErrorClear} className="ml-auto">
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Files List */}
      {uploadedFiles.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-1"
        >
          {uploadedFiles.map((file) => (
            <motion.div
              key={file.fileId}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded text-xs group hover:bg-green-100 transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm">{type === 'photo' ? '🖼️' : '🎬'}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900 truncate">{file.fileName}</p>
                  <p className="text-[10px] text-slate-500">Google Drive</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {file.webViewLink && (
                  <a
                    href={file.webViewLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 text-indigo-600 hover:bg-indigo-100 rounded transition-colors"
                    title="Ver no Drive"
                  >
                    ↗
                  </a>
                )}
                <button
                  onClick={() => onRemove(file.fileId)}
                  className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors opacity-0 group-hover:opacity-100"
                  title="Remover"
                >
                  <X size={12} />
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export const MediaUpload: React.FC<MediaUploadProps> = ({
  onPhotosUpload,
  onVideosUpload,
  maxFiles = 5,
}) => {
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedFile[]>([]);
  const [uploadedVideos, setUploadedVideos] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (file: File, type: 'photo' | 'video') => {
    if (type === 'photo' && !file.type.startsWith('image/')) {
      setError('Selecione apenas imagens');
      return;
    }
    if (type === 'video' && !file.type.startsWith('video/')) {
      setError('Selecione apenas vídeos');
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      setError('Arquivo muito grande (máximo 100MB)');
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('description', `${type === 'photo' ? 'Foto' : 'Vídeo'} do Testemunho - ${new Date().toISOString()}`);

      const response = await fetch('/api/drive/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload falhou');
      }

      const data = await response.json();
      const newFile: UploadedFile = {
        fileId: data.fileId,
        fileName: data.fileName,
        mimeType: data.mimeType,
        webViewLink: data.webViewLink,
      };

      if (type === 'photo') {
        const updatedPhotos = [...uploadedPhotos, newFile];
        setUploadedPhotos(updatedPhotos);
        onPhotosUpload(updatedPhotos);
      } else {
        const updatedVideos = [...uploadedVideos, newFile];
        setUploadedVideos(updatedVideos);
        onVideosUpload(updatedVideos);
      }
      setError(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro no upload';
      setError(errorMsg);
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handlePhotoDrop = async (e: React.DragEvent) => {
    if (uploadedPhotos.length >= maxFiles) {
      setError(`Máximo de ${maxFiles} fotos atingido`);
      return;
    }

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length && uploadedPhotos.length + i < maxFiles; i++) {
        await uploadFile(files[i], 'photo');
      }
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (uploadedPhotos.length >= maxFiles) {
      setError(`Máximo de ${maxFiles} fotos atingido`);
      return;
    }

    const files = e.target.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length && uploadedPhotos.length + i < maxFiles; i++) {
        await uploadFile(files[i], 'photo');
      }
    }
  };

  const handleVideoDrop = async (e: React.DragEvent) => {
    if (uploadedVideos.length >= maxFiles) {
      setError(`Máximo de ${maxFiles} vídeos atingido`);
      return;
    }

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length && uploadedVideos.length + i < maxFiles; i++) {
        await uploadFile(files[i], 'video');
      }
    }
  };

  const handleVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (uploadedVideos.length >= maxFiles) {
      setError(`Máximo de ${maxFiles} vídeos atingido`);
      return;
    }

    const files = e.target.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length && uploadedVideos.length + i < maxFiles; i++) {
        await uploadFile(files[i], 'video');
      }
    }
  };

  const removeFile = async (fileId: string, type: 'photo' | 'video') => {
    try {
      await fetch(`/api/drive/delete/${fileId}`, { method: 'DELETE' });
      if (type === 'photo') {
        const updated = uploadedPhotos.filter(f => f.fileId !== fileId);
        setUploadedPhotos(updated);
        onPhotosUpload(updated);
      } else {
        const updated = uploadedVideos.filter(f => f.fileId !== fileId);
        setUploadedVideos(updated);
        onVideosUpload(updated);
      }
    } catch (err) {
      setError('Erro ao deletar');
    }
  };

  return (
    <div className="space-y-6">
      {/* Fotos */}
      <MediaSection
        title="📸 Fotos do Evento"
        icon={<Image size={20} className="text-blue-600" />}
        type="photo"
        uploadedFiles={uploadedPhotos}
        isUploading={isUploading}
        error={error}
        onDrop={handlePhotoDrop}
        onFileChange={handlePhotoChange}
        onRemove={(id) => removeFile(id, 'photo')}
        onErrorClear={() => setError(null)}
        maxFiles={maxFiles}
      />

      {/* Vídeos */}
      <MediaSection
        title="🎬 Vídeos do Evento"
        icon={<Play size={20} className="text-purple-600" />}
        type="video"
        uploadedFiles={uploadedVideos}
        isUploading={isUploading}
        error={error}
        onDrop={handleVideoDrop}
        onFileChange={handleVideoChange}
        onRemove={(id) => removeFile(id, 'video')}
        onErrorClear={() => setError(null)}
        maxFiles={maxFiles}
      />

      {/* Summary */}
      {(uploadedPhotos.length > 0 || uploadedVideos.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg text-sm border border-green-200"
        >
          <CheckCircle size={18} className="flex-shrink-0" />
          <span className="font-semibold">
            {uploadedPhotos.length + uploadedVideos.length} arquivo(s) pronto(s) no Google Drive
          </span>
        </motion.div>
      )}
    </div>
  );
};
