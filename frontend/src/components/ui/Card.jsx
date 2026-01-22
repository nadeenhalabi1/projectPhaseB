import clsx from 'clsx';

/**
 * Card component
 * Professional card container following LinkedIn design
 */
export default function Card({ children, className, padding = true, ...props }) {
  return (
    <div
      className={clsx(
        'bg-white rounded-lg border border-gray-200 shadow-sm',
        padding && 'p-6',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * CardHeader component
 */
export function CardHeader({ children, className, ...props }) {
  return (
    <div
      className={clsx('mb-4 pb-4 border-b border-gray-200', className)}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * CardTitle component
 */
export function CardTitle({ children, className, ...props }) {
  return (
    <h3
      className={clsx('text-lg font-semibold text-gray-900', className)}
      {...props}
    >
      {children}
    </h3>
  );
}

/**
 * CardContent component
 */
export function CardContent({ children, className, ...props }) {
  return (
    <div className={clsx(className)} {...props}>
      {children}
    </div>
  );
}

/**
 * CardFooter component
 */
export function CardFooter({ children, className, ...props }) {
  return (
    <div
      className={clsx('mt-4 pt-4 border-t border-gray-200', className)}
      {...props}
    >
      {children}
    </div>
  );
}
