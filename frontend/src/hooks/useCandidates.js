import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import candidatesAPI from '../api/candidates';
import { useUIStore } from '../store/uiStore';

/**
 * React Query hooks for candidate management
 */

/**
 * Get ranked candidates for a job
 * @param {string} jobId - Job ID
 * @param {Object} filters - Optional filters { status }
 */
export function useCandidates(jobId, filters = {}, options = {}) {
  return useQuery({
    queryKey: ['candidates', jobId, filters],
    queryFn: () => candidatesAPI.getRankedCandidates(jobId, filters),
    enabled: !!jobId,
    ...options,
  });
}

/**
 * Get candidate by ID
 * @param {string} candidateId - Candidate ID
 */
export function useCandidate(candidateId, options = {}) {
  return useQuery({
    queryKey: ['candidates', candidateId],
    queryFn: () => candidatesAPI.getCandidateById(candidateId),
    enabled: !!candidateId,
    ...options,
  });
}

/**
 * Get candidate statistics for a job
 * @param {string} jobId - Job ID
 */
export function useCandidateStats(jobId, options = {}) {
  return useQuery({
    queryKey: ['candidates', jobId, 'stats'],
    queryFn: () => candidatesAPI.getCandidateStats(jobId),
    enabled: !!jobId,
    ...options,
  });
}

/**
 * Update candidate status
 */
export function useUpdateCandidateStatus() {
  const queryClient = useQueryClient();
  const { success, error } = useUIStore();

  return useMutation({
    mutationFn: ({ candidateId, status }) =>
      candidatesAPI.updateCandidateStatus(candidateId, status),
    onSuccess: (data, variables) => {
      const { candidateId } = variables;

      // Invalidate candidate queries
      queryClient.invalidateQueries({ queryKey: ['candidates', candidateId] });
      queryClient.invalidateQueries({ queryKey: ['candidates'] });

      success('Candidate status updated successfully!');
    },
    onError: (err) => {
      error(err.message || 'Failed to update candidate status');
    },
  });
}

/**
 * Re-rank all candidates for a job
 */
export function useRerankCandidates() {
  const queryClient = useQueryClient();
  const { success, error } = useUIStore();

  return useMutation({
    mutationFn: (jobId) => candidatesAPI.rerankCandidates(jobId),
    onSuccess: (data, jobId) => {
      // Invalidate candidate queries for this job
      queryClient.invalidateQueries({ queryKey: ['candidates', jobId] });
      queryClient.invalidateQueries({ queryKey: ['jobs', jobId] });

      success('Candidates re-ranked successfully!');
    },
    onError: (err) => {
      error(err.message || 'Failed to re-rank candidates');
    },
  });
}

/**
 * Smart re-rank - detects criteria changes and re-evaluates if needed
 */
export function useSmartRerankCandidates() {
  const queryClient = useQueryClient();
  const { success, error } = useUIStore();

  return useMutation({
    mutationFn: (jobId) => candidatesAPI.smartRerankCandidates(jobId),
    onSuccess: (data, jobId) => {
      // Invalidate candidate queries for this job
      queryClient.invalidateQueries({ queryKey: ['candidates', jobId] });
      queryClient.invalidateQueries({ queryKey: ['jobs', jobId] });

      success('Candidates re-ranked with updated criteria!');
    },
    onError: (err) => {
      error(err.message || 'Failed to re-rank candidates');
    },
  });
}

/**
 * Delete a candidate
 */
export function useDeleteCandidate() {
  const queryClient = useQueryClient();
  const { success, error } = useUIStore();

  return useMutation({
    mutationFn: (candidateId) => candidatesAPI.deleteCandidate(candidateId),
    onSuccess: () => {
      // Invalidate all related queries to ensure consistent candidate counts
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });

      success('Candidate deleted successfully!');
    },
    onError: (err) => {
      error(err.message || 'Failed to delete candidate');
    },
  });
}

/**
 * Bulk delete multiple candidates
 */
export function useBulkDeleteCandidates() {
  const queryClient = useQueryClient();
  const { success, error } = useUIStore();

  return useMutation({
    mutationFn: (candidateIds) => candidatesAPI.bulkDeleteCandidates(candidateIds),
    onSuccess: (data) => {
      // Invalidate all related queries to ensure consistent candidate counts
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });

      const count = data?.data?.deletedCount || 0;
      success(`Successfully deleted ${count} candidate${count !== 1 ? 's' : ''}!`);
    },
    onError: (err) => {
      error(err.message || 'Failed to delete candidates');
    },
  });
}

/**
 * Update candidate data
 */
export function useUpdateCandidateData() {
  const queryClient = useQueryClient();
  const { success, error } = useUIStore();

  return useMutation({
    mutationFn: ({ candidateId, updates }) =>
      candidatesAPI.updateCandidateData(candidateId, updates),
    onSuccess: () => {
      // Just invalidate everything - stop trying to be clever with cache updates
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });

      success('Candidate updated successfully!');
    },
    onError: (err) => {
      error(err.message || 'Failed to update candidate');
    },
  });
}
