import { forwardRef } from 'react';
import clsx from 'clsx';

/**
 * Input component with label and error support
 * Compatible with React Hook Form
 */
const Input = forwardRef(
  (
    {
      label,
      error,
      type = 'text',
      placeholder,
      disabled = false,
      required = false,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          className={clsx(
            'block w-full px-3 py-2 border rounded-lg shadow-sm',
            'placeholder-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-linkedin-500 focus:border-transparent',
            'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
            error
              ? 'border-red-300 focus:ring-red-500'
              : 'border-gray-300',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
