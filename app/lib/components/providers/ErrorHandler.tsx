import React, {
  Component,
  createContext,
  useState,
  ReactNode,
  useMemo,
} from 'react';

type RetryableError = Error & {
  retry: () => {};
};
type CancelableError = Error & {
  cancel: () => {};
};

function isRetryable(err: Error): err is RetryableError {
  return typeof (err as any).retry === 'function';
}

function isCancelable(err: Error): err is CancelableError {
  return typeof (err as any).cancel === 'function';
}

export const ErrorContext = createContext<(err: Error) => () => void>((err) => {
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
  const [errors, updateErrors] = useState<Error[]>([]);

  const setError = useMemo(() => {
    return (err: Error) => {
      updateErrors((prevErrors) => [...prevErrors, err]);
      return () => {
        updateErrors((prevErrors) => [
          ...prevErrors.slice(0, prevErrors.indexOf(err)),
          ...prevErrors.slice(prevErrors.indexOf(err) + 1),
        ]);
      };
    };
  }, [updateErrors]);

  return (
    <ErrorContext.Provider value={setError}>
      {errors.length ? (
        <>
          <h1>
            {errors
              .reduce(
                (memo, { message }) => {
                  if (!memo.includes(message)) {
                    memo.push(message);
                  }

                  return memo;
                },
                [] as string[],
              )
              .join(', ')}
          </h1>
          {errors.find(isRetryable) && (
            <button
              onClick={() => {
                errors.forEach((error) => {
                  if (isRetryable(error)) {
                    error.retry();
                  }
                });
              }}
            >
              Retry
            </button>
          )}
          {errors.find(isCancelable) && (
            <button
              onClick={() => {
                errors.forEach((error) => {
                  if (isCancelable(error)) {
                    error.cancel();
                  }
                });
              }}
            >
              Cancel
            </button>
          )}
        </>
      ) : null}
      <ErrorBoundary>
        <div style={{ display: errors.length ? 'none' : 'inherit' }}>
          {children}
        </div>
      </ErrorBoundary>
    </ErrorContext.Provider>
  );
}
