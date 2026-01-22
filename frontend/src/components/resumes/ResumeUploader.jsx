import { useState, useRef, useCallback } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import clsx from 'clsx';
import Button from '../ui/Button';
import ProgressBar from '../ui/ProgressBar';
import { useUploadResumes } from '../../hooks/useResumes';
import { useUIStore } from '../../store/uiStore';

/**
 * ResumeUploader component
 * Drag-and-drop resume uploader with progress tracking
 */
export default function ResumeUploader({ jobId, onUploadComplete }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const fileInputRef = useRef(null);

  const { mutate: uploadResumes, isPending, uploadProgress, resetProgress } = useUploadResumes();
  const { error: showError } = useUIStore();

  // Accepted file types
  const ACCEPTED_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ];
  const ACCEPTED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.txt'];
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  /**
   * Validate file
   */
  const validateFile = (file) => {
    // Check file type
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return `${file.name}: Invalid file type. Please upload PDF, DOC, DOCX, or TXT files.`;
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return `${file.name}: File size exceeds 10MB limit.`;
    }

    return null;
  };

  /**
   * Handle file selection
   */
  const handleFileSelect = useCallback((files) => {
    const fileArray = Array.from(files);
    const errors = [];
    const validFiles = [];

    fileArray.forEach((file) => {
      const error = validateFile(file);
      if (error) {
        errors.push(error);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      // Show each error as a separate toast notification
      errors.forEach((errorMsg) => {
        showError(errorMsg);
      });
    }

    if (validFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...validFiles]);
    }
  }, [showError]);

  /**
   * Handle drag events
   */
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  };

  /**
   * Handle input change
   */
  const handleInputChange = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  };

  /**
   * Remove file from selection
   */
  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  /**
   * Clear all files
   */
  const clearFiles = () => {
    setSelectedFiles([]);
    resetProgress();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * Upload files
   */
  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    uploadResumes(
      { jobId, files: selectedFiles },
      {
        onSuccess: async () => {
          // Show completion state
          setIsCompleting(true);

          // Brief delay to show success (1.5s)
          await new Promise(resolve => setTimeout(resolve, 1500));

          // Clear files and reset state
          clearFiles();
          setIsCompleting(false);

          // Switch to Candidates tab immediately
          onUploadComplete?.();
        },
      }
    );
  };

  // Check if any uploads are in progress
  const hasProgress = Object.keys(uploadProgress).length > 0;

  return (
    <div className="space-y-6">
      {/* Drop Zone */}
      <div
        className={clsx(
          'border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer',
          isDragging
            ? 'border-linkedin-500 bg-linkedin-50'
            : 'border-gray-300 hover:border-gray-400',
          isPending && 'opacity-50 cursor-not-allowed'
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => !isPending && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ACCEPTED_EXTENSIONS.join(',')}
          onChange={handleInputChange}
          className="hidden"
          disabled={isPending}
        />

        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />

        <div className="space-y-2">
          <p className="text-base font-medium text-gray-900">
            Drag and drop resumes here
          </p>
          <p className="text-sm text-gray-500">
            or click to browse files
          </p>
          <p className="text-xs text-gray-400">
            Supports PDF, DOC, DOCX, TXT (max 10MB each)
          </p>
        </div>
      </div>

      {/* Selected Files */}
      {selectedFiles.length > 0 && !hasProgress && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900">
              Selected Files ({selectedFiles.length})
            </h3>
            <button
              onClick={clearFiles}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Clear all
            </button>
          </div>

          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => removeFile(index)}
                  className="p-1 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
                >
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleUpload}
              disabled={isPending}
              loading={isPending}
              fullWidth
            >
              Upload {selectedFiles.length} {selectedFiles.length === 1 ? 'Resume' : 'Resumes'}
            </Button>
          </div>
        </div>
      )}

      {/* Upload Complete State */}
      {isCompleting && (
        <div className="text-center py-8">
          <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Complete!</h3>
          <p className="text-gray-600">Switching to candidates view...</p>
        </div>
      )}

      {/* Upload Progress - only show when uploading */}
      {hasProgress && !isCompleting && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-900">
            Uploading Files...
          </h3>

          <div className="space-y-3">
            {Object.entries(uploadProgress).map(([index, progress]) => (
              <ProgressBar
                key={index}
                progress={progress.progress}
                status={progress.status}
                fileName={progress.fileName}
                error={progress.error}
              />
            ))}
          </div>

          {/* Show clear button when all uploads are complete */}
          {Object.values(uploadProgress).every(
            (p) => p.status === 'success' || p.status === 'error'
          ) && (
            <Button
              onClick={clearFiles}
              variant="secondary"
              fullWidth
            >
              Upload More Resumes
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
