import { useMemo } from 'react';
export type Resource<T> = () => T;

export default function createResource<R>(
  p: Promise<R> | (() => Promise<R>),
): () => R {
  let status: 'pending' | 'success' | 'error' = 'pending';
  let error: Error;
  let result: R;
  let suspender: null | Promise<void> = null;

  const onSuccess = (r: R) => {
    status = 'success';
    result = r;
  };
  const onError = (e: Error) => {
    status = 'error';
    error = e;
  };

  if (typeof p === 'object') {
    suspender = p.then(onSuccess, onError);
  }

  return () => {
    switch (status) {
      case 'pending':
        if (suspender === null && typeof p === 'function') {
          suspender = p().then(onSuccess, onError);
        }
        throw suspender;
      case 'error':
        throw error;
      case 'success':
        return result;
    }
  };
}

export function withRetry<R>(
  read: Resource<R>,
  retry: () => void,
): Resource<R> {
  return () => {
    try {
      return read();
    } catch (e) {
      if (e instanceof Error) {
        throw Object.assign(e, {
          retry,
        });
      }
      throw e;
    }
  };
}

export function useRetryResource<R>(
  res: Resource<R>,
  retry: () => void,
): Resource<R> {
  return useMemo(() => withRetry(res, retry), [res, retry]);
}
