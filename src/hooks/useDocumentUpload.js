import { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import documentsApi from '../api/documentsApi';
import { addDocument } from '../features/documents/documentsSlice';

/**
 * Custom hook for handling document uploads
 * Manages upload state, progress tracking, and error handling
 */
const useDocumentUpload = () => {
  const dispatch = useDispatch();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadErrors, setUploadErrors] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState([]);

  /**
   * Upload a single file
   */
  const uploadSingleFile = useCallback(
    async (file, metadata = {}) => {
      const fileId = `${file.name}-${Date.now()}`;

      try {
        // Initialize progress
        setUploadProgress((prev) => ({
          ...prev,
          [fileId]: { filename: file.name, progress: 0, status: 'uploading' },
        }));

        // Upload file with progress tracking
        const response = await documentsApi.uploadDocument(
          file,
          metadata,
          (progress) => {
            setUploadProgress((prev) => ({
              ...prev,
              [fileId]: { filename: file.name, progress, status: 'uploading' },
            }));
          }
        );

        // Mark as complete
        setUploadProgress((prev) => ({
          ...prev,
          [fileId]: { filename: file.name, progress: 100, status: 'completed' },
        }));

        // Add to uploaded files
        setUploadedFiles((prev) => [...prev, response]);

        // Add to Redux store
        dispatch(addDocument(response));

        return { success: true, data: response, fileId };
      } catch (error) {
        console.error('Upload failed:', error);

        // Mark as failed
        setUploadProgress((prev) => ({
          ...prev,
          [fileId]: { filename: file.name, progress: 0, status: 'failed' },
        }));

        setUploadErrors((prev) => ({
          ...prev,
          [fileId]: error.response?.data?.message || 'Upload failed',
        }));

        return { success: false, error, fileId };
      }
    },
    [dispatch]
  );

  /**
   * Upload multiple files in parallel
   */
  const uploadMultipleFiles = useCallback(
    async (files, metadata = {}) => {
      setUploading(true);
      setUploadProgress({});
      setUploadErrors({});
      setUploadedFiles([]);

      const uploadPromises = Array.from(files).map((file) =>
        uploadSingleFile(file, metadata)
      );

      const results = await Promise.allSettled(uploadPromises);

      setUploading(false);

      // Process results
      const successful = results.filter(
        (r) => r.status === 'fulfilled' && r.value.success
      ).length;
      const failed = results.length - successful;

      return {
        total: results.length,
        successful,
        failed,
        results: results.map((r) =>
          r.status === 'fulfilled' ? r.value : { success: false, error: r.reason }
        ),
      };
    },
    [uploadSingleFile]
  );

  /**
   * Reset upload state
   */
  const resetUpload = useCallback(() => {
    setUploading(false);
    setUploadProgress({});
    setUploadErrors({});
    setUploadedFiles([]);
  }, []);

  /**
   * Remove a file from progress tracking
   */
  const removeFile = useCallback((fileId) => {
    setUploadProgress((prev) => {
      const newProgress = { ...prev };
      delete newProgress[fileId];
      return newProgress;
    });

    setUploadErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[fileId];
      return newErrors;
    });
  }, []);

  /**
   * Get overall progress percentage
   */
  const getOverallProgress = useCallback(() => {
    const progressValues = Object.values(uploadProgress);
    if (progressValues.length === 0) return 0;

    const totalProgress = progressValues.reduce(
      (sum, item) => sum + (item.progress || 0),
      0
    );
    return Math.round(totalProgress / progressValues.length);
  }, [uploadProgress]);

  /**
   * Check if all uploads are complete
   */
  const isUploadComplete = useCallback(() => {
    const progressValues = Object.values(uploadProgress);
    if (progressValues.length === 0) return false;

    return progressValues.every(
      (item) => item.status === 'completed' || item.status === 'failed'
    );
  }, [uploadProgress]);

  return {
    // State
    uploading,
    uploadProgress,
    uploadErrors,
    uploadedFiles,

    // Actions
    uploadSingleFile,
    uploadMultipleFiles,
    resetUpload,
    removeFile,

    // Computed
    getOverallProgress,
    isUploadComplete,
  };
};

export default useDocumentUpload;
