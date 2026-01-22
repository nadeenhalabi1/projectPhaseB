import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import resumesAPI from '../api/resumes';
import { useUIStore } from '../store/uiStore';
import { useState } from 'react';

/**
 * React Query hooks for resume management
 */

/**
 * Get all resumes for a job
 * @param {string} jobId - Job ID
 */
export function useJobResumes(jobId, options = {}) {
  return useQuery({
    queryKey: ['resumes', jobId],
    queryFn: () => resumesAPI.getJobResumes(jobId),
    enabled: !!jobId,
    ...options,
  });
}

/**
 * Upload resumes with progress tracking
 * Returns mutation with uploadProgress state
 */
export function useUploadResumes() {
  const queryClient = useQueryClient();
  const { success, error: showError } = useUIStore();
  const [uploadProgress, setUploadProgress] = useState({});

  const mutation = useMutation({
    mutationFn: async ({ jobId, files }) => {
      // Reset progress for new upload
      const initialProgress = {};
      Array.from(files).forEach((file, index) => {
        initialProgress[index] = {
          fileName: file.name,
          progress: 0,
          status: 'uploading', // uploading, success, error
          error: null,
        };
      });
      setUploadProgress(initialProgress);

      // Upload with progress callback
      const result = await resumesAPI.uploadResumes(
        jobId,
        files,
        (percentCompleted) => {
          // Update overall progress
          setUploadProgress((prev) => {
            const updated = { ...prev };
            Object.keys(updated).forEach((key) => {
              if (updated[key].status === 'uploading') {
                updated[key].progress = percentCompleted;
              }
            });
            return updated;
          });
        }
      );

      // Update individual file statuses based on result
      setUploadProgress((prev) => {
        const updated = { ...prev };

        // Mark all as complete (API returns overall success/error counts)
        Object.keys(updated).forEach((key, index) => {
          // Check if detailed results exist in response
          if (result?.results && result.results[index]) {
            const fileResult = result.results[index];
            updated[key].status = fileResult.success ? 'success' : 'error';
            updated[key].progress = 100;
            updated[key].error = fileResult.error || null;
          } else if (result?.data?.results && result.data.results[index]) {
            // Fallback for nested data structure
            const fileResult = result.data.results[index];
            updated[key].status = fileResult.success ? 'success' : 'error';
            updated[key].progress = 100;
            updated[key].error = fileResult.error || null;
          } else {
            // Fallback if no detailed results - mark as success
            updated[key].status = 'success';
            updated[key].progress = 100;
          }
        });

        return updated;
      });

      return result;
    },
    onSuccess: async (data, variables) => {
      const { jobId } = variables;

      // Extract response data (handle both data.data and direct data structures)
      const responseData = data?.data || data;
      const errors = responseData.errors || [];
      const successCount = responseData.successCount || 0;
      const errorCount = responseData.errorCount || 0;

      // Show error toasts for failed files
      if (errors.length > 0) {
        errors.forEach((errorItem) => {
          // Truncate long filenames for better readability
          const filename = errorItem.filename.length > 30
            ? errorItem.filename.substring(0, 27) + '...'
            : errorItem.filename;

          // Simplify error message for common cases
          let errorMsg = errorItem.error;
          if (errorMsg.includes('validation failed')) {
            errorMsg = 'Invalid email address extracted';
          } else if (errorMsg.includes('PDF parsing failed')) {
            errorMsg = 'Could not parse PDF';
          } else if (errorMsg.includes('empty')) {
            errorMsg = 'File appears empty';
          }

          showError(`${filename}: ${errorMsg}`);
        });
      }

      // Invalidate all related queries to ensure consistent candidate counts
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['resumes', jobId] });

      // Show appropriate success message
      if (successCount > 0 && errorCount === 0) {
        success(`Successfully uploaded ${successCount} resume(s)!`);
      } else if (successCount > 0 && errorCount > 0) {
        success(`Successfully uploaded ${successCount} resume(s). ${errorCount} failed - see errors above.`);
      }
      // If all failed (successCount === 0), no success toast (only error toasts shown)
    },
    onError: (err) => {
      showError(err.message || 'Failed to upload resumes');

      // Mark all as error
      setUploadProgress((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((key) => {
          updated[key].status = 'error';
          updated[key].error = err.message;
        });
        return updated;
      });
    },
  });

  return {
    ...mutation,
    uploadProgress,
    resetProgress: () => setUploadProgress({}),
  };
}

/**
 * Delete a resume
 */
export function useDeleteResume() {
  const queryClient = useQueryClient();
  const { success, error } = useUIStore();

  return useMutation({
    mutationFn: (resumeId) => resumesAPI.deleteResume(resumeId),
    onSuccess: () => {
      // Invalidate all resume queries
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      success('Resume deleted successfully!');
    },
    onError: (err) => {
      error(err.message || 'Failed to delete resume');
    },
  });
}
