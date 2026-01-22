import { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import clsx from 'clsx';

/**
 * Toast notification component
 * Displays toast notifications from the UI store
 */
export default function Toast() {
  const { toasts, removeToast } = useUIStore();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-md w-full pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

/**
 * Individual toast item
 */
function ToastItem({ toast, onClose }) {
  const { id, type, message, duration } = toast;

  // Get icon and colors based on type
  const getToastConfig = (type) => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircle,
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          iconColor: 'text-green-500',
          textColor: 'text-green-800',
        };
      case 'error':
        return {
          icon: AlertCircle,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          iconColor: 'text-red-500',
          textColor: 'text-red-800',
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          iconColor: 'text-yellow-500',
          textColor: 'text-yellow-800',
        };
      case 'info':
      default:
        return {
          icon: Info,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          iconColor: 'text-blue-500',
          textColor: 'text-blue-800',
        };
    }
  };

  const config = getToastConfig(type);
  const Icon = config.icon;

  return (
    <div
      className={clsx(
        'flex items-start gap-3 p-4 rounded-lg border shadow-lg pointer-events-auto',
        'animate-slide-in-right',
        config.bgColor,
        config.borderColor
      )}
    >
      {/* Icon */}
      <Icon className={clsx('h-5 w-5 flex-shrink-0 mt-0.5', config.iconColor)} />

      {/* Message */}
      <div className="flex-1 min-w-0">
        <p className={clsx('text-sm font-medium', config.textColor)}>
          {message}
        </p>
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        className={clsx(
          'flex-shrink-0 p-1 rounded-md transition-colors',
          'hover:bg-white/50 focus:outline-none focus:ring-2 focus:ring-offset-1',
          type === 'success' && 'focus:ring-green-500',
          type === 'error' && 'focus:ring-red-500',
          type === 'warning' && 'focus:ring-yellow-500',
          type === 'info' && 'focus:ring-blue-500'
        )}
      >
        <X className={clsx('h-4 w-4', config.iconColor)} />
      </button>
    </div>
  );
}
