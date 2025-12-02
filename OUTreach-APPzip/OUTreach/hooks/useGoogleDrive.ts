import { useState } from 'react';

export interface DriveFile {
  id: string;
  name: string;
  type: 'folder' | 'file';
  mimeType: string;
  webViewLink?: string;
  createdTime?: string;
  modifiedTime?: string;
}

export interface UploadResult {
  success: boolean;
  fileId?: string;
  fileName?: string;
  error?: string;
}

export const useGoogleDrive = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [files, setFiles] = useState<DriveFile[]>([]);

  /**
   * Upload file to Google Drive
   * Requires Google Drive integration to be set up
   */
  const uploadFile = async (
    file: File,
    parentFolderId?: string,
    description?: string
  ): Promise<UploadResult> => {
    setIsProcessing(true);
    try {
      // This will use the configured Google Drive integration
      // The actual implementation depends on the Replit integration setup
      
      const formData = new FormData();
      formData.append('file', file);
      if (parentFolderId) {
        formData.append('parentId', parentFolderId);
      }
      if (description) {
        formData.append('description', description);
      }

      const response = await fetch('/api/drive/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        fileId: data.fileId,
        fileName: file.name
      };
    } catch (error) {
      console.error("Upload failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * List files in a Google Drive folder
   */
  const listFiles = async (folderId?: string): Promise<DriveFile[]> => {
    setIsProcessing(true);
    try {
      const queryParams = new URLSearchParams();
      if (folderId) {
        queryParams.append('folderId', folderId);
      }

      const response = await fetch(`/api/drive/list?${queryParams}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`List failed: ${response.statusText}`);
      }

      const data = await response.json();
      setFiles(data.files || []);
      return data.files || [];
    } catch (error) {
      console.error("List failed:", error);
      return [];
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Delete a file from Google Drive
   */
  const deleteFile = async (fileId: string): Promise<boolean> => {
    setIsProcessing(true);
    try {
      const response = await fetch(`/api/drive/delete/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Delete failed: ${response.statusText}`);
      }

      // Update local files list
      setFiles(files.filter(f => f.id !== fileId));
      return true;
    } catch (error) {
      console.error("Delete failed:", error);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Create a folder in Google Drive
   */
  const createFolder = async (
    folderName: string,
    parentFolderId?: string
  ): Promise<UploadResult> => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/drive/create-folder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: folderName,
          parentId: parentFolderId
        })
      });

      if (!response.ok) {
        throw new Error(`Create folder failed: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        fileId: data.folderId,
        fileName: folderName
      };
    } catch (error) {
      console.error("Create folder failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Create folder failed'
      };
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    files,
    uploadFile,
    listFiles,
    deleteFile,
    createFolder
  };
};
