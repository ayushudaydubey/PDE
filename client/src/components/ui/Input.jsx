import React from 'react';

const Input = React.forwardRef(
  ({ label, error, className = '', id, ...props }, ref) => {
    const inputId = id || Math.random().toString(36).substring(7);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
          </label>

        )}
        <input
          id={inputId}
          ref={ref}
          className={`flex h-10 w-full rounded-md border ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
            } bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
