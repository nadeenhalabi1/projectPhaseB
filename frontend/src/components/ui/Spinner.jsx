import clsx from 'clsx';

/**
 * Loading spinner component
 */
export default function Spinner({ size = 'md', className }) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  return (
    <div
      className={clsx(
        'inline-block animate-spin rounded-full border-4 border-solid border-linkedin-500 border-r-transparent',
        sizes[size],
        className
      )}
      role="status"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

/**
 * Full page loading spinner
 */
export function PageSpinner({ message = 'Loading...' }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <Spinner size="lg" />
        {message && <p className="mt-4 text-gray-600">{message}</p>}
      </div>
    </div>
  );
}

/**
 * Centered spinner for content areas
 */
export function CenteredSpinner({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Spinner size="md" />
      {message && <p className="mt-3 text-sm text-gray-600">{message}</p>}
    </div>
  );
}
