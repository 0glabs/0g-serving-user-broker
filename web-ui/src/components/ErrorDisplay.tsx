import React from 'react';
import { errorHandler } from '../utils/errorHandling';

interface ErrorDisplayProps {
  error: string;
  onClose?: () => void;
  className?: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onClose,
  className = '',
}) => {
  const sanitizedError = errorHandler.sanitizeErrorMessage(error);

  const formatError = (errorText: string): string => {
    try {
      // Try to parse as JSON if it looks like JSON (but safely)
      if (errorText.trim().startsWith('{') && errorText.trim().endsWith('}')) {
        const parsed = JSON.parse(errorText);
        return JSON.stringify(parsed, null, 2);
      }
      return errorText;
    } catch {
      return errorText;
    }
  };

  return (
    <div className={`bg-red-50 border border-red-200 rounded-xl p-4 ${className}`}>
      <div className="flex items-start">
        <svg
          className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-red-800">Error</h3>
          <pre className="text-sm text-red-700 mt-1 break-words whitespace-pre-wrap font-mono bg-red-100 p-2 rounded border overflow-x-auto">
            {formatError(sanitizedError)}
          </pre>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-2 text-red-400 hover:text-red-600 flex-shrink-0 p-1"
            title="Close error message"
            aria-label="Close error"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};