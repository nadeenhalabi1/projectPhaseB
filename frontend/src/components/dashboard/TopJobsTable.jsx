import { useNavigate } from 'react-router-dom';
import { Trophy } from 'lucide-react';
import Table from '../ui/Table';
import Badge from '../ui/Badge';
import Spinner from '../ui/Spinner';
import { useMemo } from 'react';

/**
 * Table showing top performing jobs by candidate count
 * Displays top 5 jobs with rank, candidate count, and average score
 */
export default function TopJobsTable({ jobs, isLoading }) {
  const navigate = useNavigate();

  const topJobs = useMemo(() => {
    if (!jobs || jobs.length === 0) return [];

    return [...jobs]
      .sort((a, b) => (b.candidateCount || 0) - (a.candidateCount || 0))
      .slice(0, 5);
  }, [jobs]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner />
      </div>
    );
  }

  if (topJobs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No jobs available
      </div>
    );
  }

  return (
    <Table>
      <Table.Head>
        <Table.Row>
          <Table.Header>Rank</Table.Header>
          <Table.Header>Job Title</Table.Header>
          <Table.Header>Candidates</Table.Header>
          <Table.Header>Status</Table.Header>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        {topJobs.map((job, index) => (
          <Table.Row
            key={job._id}
            onClick={() => navigate(`/jobs/${job._id}`)}
            className="cursor-pointer hover:bg-gray-50"
          >
            <Table.Cell>
              <div className="flex items-center gap-2">
                {index < 3 && (
                  <Trophy
                    className={`h-4 w-4 ${
                      index === 0
                        ? 'text-yellow-500'
                        : index === 1
                        ? 'text-gray-400'
                        : 'text-orange-600'
                    }`}
                  />
                )}
                <span className="font-semibold">#{index + 1}</span>
              </div>
            </Table.Cell>
            <Table.Cell>
              <span className="font-medium">{job.title}</span>
            </Table.Cell>
            <Table.Cell>
              <span className="font-semibold text-linkedin-600">
                {job.candidateCount || 0}
              </span>
            </Table.Cell>
            <Table.Cell>
              <Badge variant={job.status?.toLowerCase() || 'draft'}>
                {job.status || 'DRAFT'}
              </Badge>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
}
