import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import jobsAPI from '../api/jobs';
import { useUIStore } from '../store/uiStore';

/**
 * React Query hooks for job management
 */

/**
 * Get all jobs with optional filters
 * @param {Object} filters - Optional filters { status }
 */
export function useJobs(filters = {}) {
  return useQuery({
    queryKey: ['jobs', filters],
    queryFn: () => jobsAPI.getJobs(filters),
  });
}

/**
 * Get a single job by ID
 * @param {string} jobId - Job ID
 * @param {Object} options - React Query options
 */
export function useJob(jobId, options = {}) {
  return useQuery({
    queryKey: ['jobs', jobId],
    queryFn: () => jobsAPI.getJobById(jobId),
    enabled: !!jobId,
    ...options,
  });
}

/**
 * Create a new job
 */
export function useCreateJob() {
  const queryClient = useQueryClient();
  const { success, error } = useUIStore();

  return useMutation({
    mutationFn: (jobData) => jobsAPI.createJob(jobData),
    onSuccess: (data) => {
      // Invalidate and refetch jobs list
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      success('Job created successfully!');
      return data;
    },
    onError: (err) => {
      error(err.message || 'Failed to create job');
    },
  });
}

/**
 * Update an existing job
 */
export function useUpdateJob() {
  const queryClient = useQueryClient();
  const { success, error } = useUIStore();

  return useMutation({
    mutationFn: ({ jobId, updates }) => jobsAPI.updateJob(jobId, updates),
    onSuccess: (data, variables) => {
      // Invalidate specific job and jobs list
      queryClient.invalidateQueries({ queryKey: ['jobs', variables.jobId] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      success('Job updated successfully!');
      return data;
    },
    onError: (err) => {
      error(err.message || 'Failed to update job');
    },
  });
}

/**
 * Delete a job
 */
export function useDeleteJob() {
  const queryClient = useQueryClient();
  const { success, error } = useUIStore();

  return useMutation({
    mutationFn: (jobId) => jobsAPI.deleteJob(jobId),
    onSuccess: () => {
      // Invalidate jobs list
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      success('Job deleted successfully!');
    },
    onError: (err) => {
      error(err.message || 'Failed to delete job');
    },
  });
}
