import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, ArrowDownUp, Trash2 } from 'lucide-react';
import Table from '../ui/Table';
import Badge from '../ui/Badge';
import Select from '../ui/Select';
import Spinner from '../ui/Spinner';
import Button from '../ui/Button';
import ConfirmDialog from '../common/ConfirmDialog';
import { useUpdateCandidateStatus, useRerankCandidates, useSmartRerankCandidates, useDeleteCandidate, useBulkDeleteCandidates } from '../../hooks/useCandidates';

/**
 * CandidatesTable component
 * Displays ranked candidates with sorting and status updates
 */
export default function CandidatesTable({ jobId, candidates = [], isLoading }) {
  const navigate = useNavigate();
  const [sortConfig, setSortConfig] = useState({ key: 'rank', direction: 'asc' });
  const [showRankDialog, setShowRankDialog] = useState(false);
  const [deleteDialogState, setDeleteDialogState] = useState({ show: false, candidateId: null, candidateName: '' });
  const [selectedCandidates, setSelectedCandidates] = useState(new Set());
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const { mutate: updateStatus } = useUpdateCandidateStatus();
  const rerankMutation = useRerankCandidates();
  const smartRerankMutation = useSmartRerankCandidates();
  const deleteMutation = useDeleteCandidate();
  const bulkDeleteMutation = useBulkDeleteCandidates();

  // Status options (without delete option)
  const STATUS_OPTIONS = [
    { value: 'PENDING', label: 'Pending' },
    { value: 'PROCESSING', label: 'Processing' },
    { value: 'PROCESSED', label: 'Processed' },
    { value: 'SHORTLISTED', label: 'Shortlisted' },
    { value: 'REJECTED', label: 'Rejected' },
    { value: 'INTERVIEW_SCHEDULED', label: 'Interview Scheduled' },
  ];

  /**
   * Sort candidates
   */
  const sortedCandidates = [...candidates].sort((a, b) => {
    const { key, direction } = sortConfig;

    let aValue = a[key];
    let bValue = b[key];

    // Special handling for nested values
    if (key === 'name') {
      aValue = a.name?.toLowerCase() || '';
      bValue = b.name?.toLowerCase() || '';
    }

    if (aValue < bValue) {
      return direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  /**
   * Handle sort
   */
  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  /**
   * Handle row click
   */
  const handleRowClick = (candidateId) => {
    navigate(`/jobs/${jobId}/candidates/${candidateId}`);
  };

  /**
   * Handle status change
   */
  const handleStatusChange = (newStatus, candidateId) => {
    updateStatus({ candidateId, status: newStatus });
  };

  /**
   * Handle delete icon click
   */
  const handleDeleteClick = (e, candidateId, candidateName) => {
    e.stopPropagation(); // Prevent row click
    setDeleteDialogState({
      show: true,
      candidateId,
      candidateName: candidateName || 'this candidate',
    });
  };

  /**
   * Handle delete confirmation
   */
  const handleDeleteConfirm = async () => {
    try {
      await deleteMutation.mutateAsync(deleteDialogState.candidateId);
      setDeleteDialogState({ show: false, candidateId: null, candidateName: '' });
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  /**
   * Handle quick re-ranking (from cached scores)
   */
  const handleQuickRerank = async () => {
    try {
      await rerankMutation.mutateAsync(jobId);
      setShowRankDialog(false);
    } catch (error) {
      console.error('Quick reranking failed:', error);
    }
  };

  /**
   * Handle smart re-ranking (with AI re-evaluation if needed)
   */
  const handleSmartRerank = async () => {
    try {
      await smartRerankMutation.mutateAsync(jobId);
      setShowRankDialog(false);
    } catch (error) {
      console.error('Smart reranking failed:', error);
    }
  };

  /**
   * Get rank icon
   */
  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy className="h-4 w-4 text-yellow-500" />;
    if (rank === 2) return <Trophy className="h-4 w-4 text-gray-400" />;
    if (rank === 3) return <Trophy className="h-4 w-4 text-orange-600" />;
    return null;
  };

  /**
   * Toggle selection for a single candidate
   */
  const toggleCandidateSelection = (candidateId, e) => {
    e.stopPropagation(); // Prevent row click
    setSelectedCandidates((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(candidateId)) {
        newSet.delete(candidateId);
      } else {
        newSet.add(candidateId);
      }
      return newSet;
    });
  };

  /**
   * Toggle select all candidates
   */
  const toggleSelectAll = (e) => {
    e.stopPropagation();
    if (selectedCandidates.size === candidates.length) {
      // Deselect all
      setSelectedCandidates(new Set());
    } else {
      // Select all
      setSelectedCandidates(new Set(candidates.map((c) => c._id)));
    }
  };

  /**
   * Handle bulk delete
   */
  const handleBulkDelete = () => {
    const candidateIds = Array.from(selectedCandidates);
    bulkDeleteMutation.mutate(candidateIds, {
      onSuccess: () => {
        setSelectedCandidates(new Set());
        setShowBulkDeleteDialog(false);
      },
    });
  };

  const allSelected = candidates.length > 0 && selectedCandidates.size === candidates.length;
  const someSelected = selectedCandidates.size > 0 && selectedCandidates.size < candidates.length;

  return (
    <div>
      {/* Header - ALWAYS visible */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Candidates ({candidates.length})
          {selectedCandidates.size > 0 && (
            <span className="ml-2 text-sm text-gray-500">
              ({selectedCandidates.size} selected)
            </span>
          )}
        </h2>

        <div className="flex gap-2">
          {selectedCandidates.size > 0 && (
            <Button
              onClick={() => setShowBulkDeleteDialog(true)}
              disabled={bulkDeleteMutation.isPending}
              loading={bulkDeleteMutation.isPending}
              variant="danger"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Selected ({selectedCandidates.size})
            </Button>
          )}
          <Button
            onClick={() => setShowRankDialog(true)}
            disabled={rerankMutation.isPending || candidates.length === 0}
            loading={rerankMutation.isPending}
            variant="primary"
          >
            <ArrowDownUp className="h-4 w-4 mr-2" />
            Rank {candidates.length > 0 ? `${candidates.length} ` : ''}Candidates
          </Button>
        </div>
      </div>

      {/* Rerank Method Selection Dialog */}
      {showRankDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Rerank Candidates
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Choose how you want to rerank candidates:
            </p>

            <div className="space-y-3">
              {/* Smart Rerank - Primary option */}
              <button
                onClick={handleSmartRerank}
                disabled={smartRerankMutation.isPending || rerankMutation.isPending}
                className="w-full flex flex-col items-start p-4 border-2 border-linkedin-500 bg-linkedin-50 rounded-lg hover:bg-linkedin-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="font-semibold text-gray-900">Smart Rerank (Recommended)</span>
                  {smartRerankMutation.isPending && <Spinner size="sm" />}
                </div>
                <span className="text-xs text-gray-600 text-left">
                  Auto-detects criteria changes and re-evaluates with AI only when needed. Fast if no changes, accurate if criteria changed.
                </span>
              </button>

              {/* Quick Rerank - Secondary option */}
              <button
                onClick={handleQuickRerank}
                disabled={smartRerankMutation.isPending || rerankMutation.isPending}
                className="w-full flex flex-col items-start p-4 border-2 border-gray-300 bg-white rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="font-semibold text-gray-900">Quick Rerank</span>
                  {rerankMutation.isPending && <Spinner size="sm" />}
                </div>
                <span className="text-xs text-gray-600 text-left">
                  Recalculate from cached scores (instant, free). Use when only weights changed.
                </span>
              </button>
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                onClick={() => setShowRankDialog(false)}
                disabled={smartRerankMutation.isPending || rerankMutation.isPending}
                variant="secondary"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogState.show}
        title="Delete Candidate?"
        message={`Are you sure you want to delete ${deleteDialogState.candidateName}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteDialogState({ show: false, candidateId: null, candidateName: '' })}
        isLoading={deleteMutation.isPending}
        variant="danger"
      />

      {/* Bulk Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showBulkDeleteDialog}
        title="Delete Selected Candidates?"
        message={`Are you sure you want to delete ${selectedCandidates.size} candidate${selectedCandidates.size !== 1 ? 's' : ''}? This action cannot be undone.`}
        confirmText={`Delete ${selectedCandidates.size} Candidate${selectedCandidates.size !== 1 ? 's' : ''}`}
        cancelText="Cancel"
        onConfirm={handleBulkDelete}
        onClose={() => setShowBulkDeleteDialog(false)}
        isLoading={bulkDeleteMutation.isPending}
        variant="danger"
      />

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && candidates.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No candidates found</p>
          <p className="text-sm text-gray-400 mt-1">
            Upload resumes to see ranked candidates
          </p>
        </div>
      )}

      {/* Candidates Table */}
      {!isLoading && candidates.length > 0 && (
        <div className="bg-white shadow-sm rounded-lg">
          <Table>
        <Table.Head>
          <Table.Row>
            <Table.Header className="w-12">
              <div className="flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected;
                  }}
                  onClick={(e) => e.stopPropagation()}
                  onChange={toggleSelectAll}
                  className="h-7 w-7 rounded border-gray-300 text-linkedin-600 focus:ring-linkedin-500 cursor-pointer"
                />
              </div>
            </Table.Header>
            <Table.Header
              sortable
              sortDirection={sortConfig.key === 'rank' ? sortConfig.direction : null}
              onSort={() => handleSort('rank')}
            >
              Rank
            </Table.Header>
            <Table.Header
              sortable
              sortDirection={sortConfig.key === 'name' ? sortConfig.direction : null}
              onSort={() => handleSort('name')}
            >
              Name
            </Table.Header>
            <Table.Header>Email</Table.Header>
            <Table.Header
              sortable
              sortDirection={sortConfig.key === 'overallScore' ? sortConfig.direction : null}
              onSort={() => handleSort('overallScore')}
            >
              Score
            </Table.Header>
            <Table.Header>Status</Table.Header>
            <Table.Header>Actions</Table.Header>
          </Table.Row>
        </Table.Head>

        <Table.Body>
          {sortedCandidates.map((candidate) => {
            const isTopThree = candidate.rank <= 3;
            const isSelected = selectedCandidates.has(candidate._id);

            return (
              <Table.Row
                key={candidate._id}
                onClick={() => handleRowClick(candidate._id)}
                highlight={isTopThree}
              >
                <Table.Cell>
                  <div className="flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => toggleCandidateSelection(candidate._id, e)}
                      className="h-7 w-7 rounded border-gray-300 text-linkedin-600 focus:ring-linkedin-500 cursor-pointer"
                    />
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex items-center gap-2">
                    {getRankIcon(candidate.rank)}
                    <span className="font-semibold text-gray-900">
                      #{candidate.rank}
                    </span>
                  </div>
                </Table.Cell>

                <Table.Cell>
                  <div className="font-medium text-gray-900">
                    {candidate.name || 'Unknown'}
                  </div>
                </Table.Cell>

                <Table.Cell>
                  <div className="text-gray-500">
                    {candidate.email || 'N/A'}
                  </div>
                </Table.Cell>

                <Table.Cell>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-linkedin-500 h-2 rounded-full"
                        style={{
                          width: `${Math.min(100, candidate.overallScore || 0)}%`,
                        }}
                      />
                    </div>
                    <span className="font-medium text-gray-900 min-w-[3rem]">
                      {(candidate.overallScore || 0).toFixed(2)}
                    </span>
                  </div>
                </Table.Cell>

                <Table.Cell>
                  <Badge variant={candidate.status?.toLowerCase() || 'pending'}>
                    {candidate.status || 'PENDING'}
                  </Badge>
                </Table.Cell>

                <Table.Cell>
                  <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-2">
                    <Select
                      value={candidate.status || 'PENDING'}
                      onChange={(newStatus) => handleStatusChange(newStatus, candidate._id)}
                      options={STATUS_OPTIONS}
                      size="sm"
                      className="w-48"
                    />
                    <button
                      onClick={(e) => handleDeleteClick(e, candidate._id, candidate.name)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete candidate"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>
        </div>
      )}
    </div>
  );
}
