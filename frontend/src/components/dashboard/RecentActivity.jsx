import { useMemo } from 'react';
import { Clock, Briefcase, Users, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Spinner from '../ui/Spinner';

/**
 * Recent Activity Feed
 * Shows recent jobs and updates
 */
export default function RecentActivity({ jobs, isLoading }) {
  const activities = useMemo(() => {
    if (!jobs || jobs.length === 0) return [];

    // Create activity items from jobs
    const items = jobs
      .map(job => ({
        id: job._id,
        type: 'job_created',
        title: job.title,
        description: `Job created with ${job.candidateCount || 0} candidates`,
        timestamp: new Date(job.createdAt),
        icon: Briefcase,
        color: 'text-blue-500',
        bgColor: 'bg-blue-50',
      }))
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 5);

    return items;
  }, [jobs]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Clock className="mx-auto h-12 w-12 text-gray-300 mb-2" />
        <p>No recent activity</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => {
        const Icon = activity.icon;
        return (
          <div key={activity.id} className="flex gap-4">
            <div className={`flex-shrink-0 w-10 h-10 rounded-full ${activity.bgColor} flex items-center justify-center`}>
              <Icon className={`h-5 w-5 ${activity.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {activity.title}
              </p>
              <p className="text-sm text-gray-500">
                {activity.description}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
