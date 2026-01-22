import clsx from 'clsx';

/**
 * Badge component
 * Status badges with color-coded variants
 */
export default function Badge({ children, variant = 'default', size = 'md', className }) {
  const variants = {
    // Status colors
    default: 'bg-gray-100 text-gray-700',
    pending: 'bg-gray-100 text-gray-700',
    processing: 'bg-blue-100 text-blue-700',
    processed: 'bg-green-100 text-green-700',
    shortlisted: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    interview_scheduled: 'bg-purple-100 text-purple-700',
    // Additional variants
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center font-medium rounded-full',
        variants[variant.toLowerCase()] || variants.default,
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
}
