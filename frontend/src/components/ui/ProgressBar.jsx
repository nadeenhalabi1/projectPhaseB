import clsx from 'clsx';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

/**
 * ProgressBar component
 * Shows upload or processing progress with status indicators
 */
export default function ProgressBar({
  progress = 0,
  status = 'uploading', // uploading, success, error
  fileName,
  error,
  size = 'md',
  showIcon = true,
  className,
}) {
  const sizes = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  const statusColors = {
    uploading: 'bg-linkedin-500',
    success: 'bg-green-500',
    error: 'bg-red-500',
  };

  const statusIcons = {
    uploading: <Loader2 className="h-4 w-4 animate-spin text-linkedin-500" />,
    success: <CheckCircle className="h-4 w-4 text-green-500" />,
    error: <XCircle className="h-4 w-4 text-red-500" />,
  };

  return (
    <div className={clsx('w-full', className)}>
      {/* File name and status */}
      {fileName && (
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2 min-w-0">
            {showIcon && statusIcons[status]}
            <span className="text-sm font-medium text-gray-700 truncate">
              {fileName}
            </span>
          </div>
          <span className="text-sm text-gray-500 ml-2 flex-shrink-0">
            {progress}%
          </span>
        </div>
      )}

      {/* Progress bar */}
      <div className={clsx('w-full bg-gray-200 rounded-full overflow-hidden', sizes[size])}>
        <div
          className={clsx(
            'h-full transition-all duration-300 ease-out rounded-full',
            statusColors[status]
          )}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>

      {/* Error message */}
      {error && status === 'error' && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}
