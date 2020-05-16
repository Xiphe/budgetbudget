import { useMemo } from 'react';
export type Resource<T> = {
  read: () => T;
};

export default function createResource<R>(promise: Promise<R>): Resource<R> {
  let status: 'pending' | 'success' | 'error' = 'pending';
  let error: Error;
  let result: R;
  let suspender = promise.then(
    (r) => {
      status = 'success';
      result = r;
    },
    (e) => {
      status = 'error';
      error = e;
    },
  );
  return {
    read(): R {
      switch (status) {
        case 'pending':
          throw suspender;
        case 'error':
          throw error;
        case 'success':
          return result;
      }
    },
  };
}

export function withRetry<R>(res: Resource<R>, retry: () => void): Resource<R> {
  return {
    ...res,
    read(...args): R {
      try {
        return res.read(...args);
      } catch (e) {
        if (e instanceof Promise) {
          throw e;
        }
        throw Object.assign(e, {
          retry,
        });
      }
    },
  };
}

export function useRetryResource<R>(
  res: Resource<R>,
  retry: () => void,
): Resource<R> {
  return useMemo(() => withRetry(res, retry), [res, retry]);
}
