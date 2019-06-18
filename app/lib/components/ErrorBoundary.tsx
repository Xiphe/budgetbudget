import React, { Component, createContext, useState, ReactNode } from 'react';
import { IpcError } from '../../../shared/ipc';

type MaybeError = null | Error | IpcError;
type RetryableError = Error & {
  retry: () => {};
};
type CancelableError = Error & {
  cancel: () => {};
};

function isRetryable(err: MaybeError): err is RetryableError {
  return typeof (err as any).retry === 'function';
}

function isCancelable(err: MaybeError): err is CancelableError {
  return typeof (err as any).cancel === 'function';
}

export const ErrorContext = createContext<(err: MaybeError) => void>((err) => {
  throw err;
});

class ErrorBoundary extends Component {
  state: {
    error?: Error;
  } = {};

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    const { error } = this.state;
    if (error) {
      return (
        <ErrorContext.Consumer>
          {(setError) => {
            setError(error);
            return null;
          }}
        </ErrorContext.Consumer>
      );
    }

    return this.props.children;
  }
}

export default function ManualErrorHandler({
  children,
}: {
  children: ReactNode;
}) {
  const [error, setError] = useState<MaybeError>(null);
  return (
    <ErrorContext.Provider value={setError}>
      {error && (
        <>
          <h1>{error.message}</h1>
          {isRetryable(error) && <button onClick={error.retry}>Retry</button>}
          {isCancelable(error) && (
            <button onClick={error.cancel}>Cancel</button>
          )}
        </>
      )}
      <ErrorBoundary>
        <div style={{ display: error ? 'none' : 'inherit' }}>{children}</div>
      </ErrorBoundary>
    </ErrorContext.Provider>
  );
}
