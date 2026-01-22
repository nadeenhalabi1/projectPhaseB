import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Upload, TrendingUp } from 'lucide-react';
import Button from '../ui/Button';

/**
 * Pending Actions Widget
 * Shows items that need attention
 */
export default function PendingActions({ jobs, stats }) {
  const navigate = useNavigate();

  const pendingItems = useMemo(() => {
    const items = [];

    // Jobs without candidates
    const jobsWithoutCandidates = jobs?.filter(job => !job.candidateCount || job.candidateCount === 0) || [];
    if (jobsWithoutCandidates.length > 0) {
      items.push({
        id: 'no-candidates',
        title: `${jobsWithoutCandidates.length} job${jobsWithoutCandidates.length > 1 ? 's' : ''} without candidates`,
        description: 'Upload resumes to start screening',
        action: 'Upload Resumes',
        onClick: () => navigate(`/jobs/${jobsWithoutCandidates[0]._id}`),
        icon: Upload,
        color: 'text-orange-600',
      });
    }

    // Jobs that need ranking
    const jobsNeedingRanking = jobs?.filter(job =>
      job.candidateCount > 0 && (!job.status || job.status === 'DRAFT')
    ) || [];
    if (jobsNeedingRanking.length > 0) {
      items.push({
        id: 'needs-ranking',
        title: `${jobsNeedingRanking.length} job${jobsNeedingRanking.length > 1 ? 's' : ''} ready for ranking`,
        description: 'Rank candidates to find top matches',
        action: 'View Jobs',
        onClick: () => navigate('/jobs'),
        icon: TrendingUp,
        color: 'text-blue-600',
      });
    }

    return items;
  }, [jobs, navigate]);

  if (pendingItems.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="mx-auto h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
          <AlertCircle className="h-6 w-6 text-green-600" />
        </div>
        <p className="font-medium text-gray-900">All caught up!</p>
        <p className="text-sm">No pending actions at the moment</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {pendingItems.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.id}
            className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200"
          >
            <Icon className={`h-5 w-5 mt-0.5 ${item.color}`} />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 text-sm">
                {item.title}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {item.description}
              </p>
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={item.onClick}
              className="flex-shrink-0"
            >
              {item.action}
            </Button>
          </div>
        );
      })}
    </div>
  );
}
