import { useQuery } from '@tanstack/react-query';
import dashboardAPI from '../api/dashboard';

/**
 * React Query hook for dashboard data
 */
export function useDashboard(options = {}) {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardAPI.getDashboard,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}
