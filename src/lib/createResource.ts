import { useState, useMemo, Dispatch, SetStateAction } from 'react';
export type Resource<T> = {
  reCreate: () => Resource<T>;
  read: (...props: any[]) => T;
};
export type RefreshResource<T> = Resource<T> & {
  refresh: () => void;
};

export default function createResource<R>(get: () => Promise<R>): Resource<R> {
  let status: 'pending' | 'success' | 'error' = 'pending';
  let error: Error;
  let result: R;
  let suspender = get().then(
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
    reCreate(): Resource<R> {
      return createResource(get);
    },
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

export function withRefresh<R>(
  res: Resource<R>,
  refresh: () => void,
): RefreshResource<R> {
  return {
    ...res,
    refresh,
    read(...args): R {
      try {
        return res.read(...args);
      } catch (e) {
        if (e instanceof Promise) {
          throw e;
        }
        throw Object.assign(e, {
          retry: refresh,
        });
      }
    },
  };
}

export function useRefreshResource<R>(
  initialRes: Resource<R>,
): [RefreshResource<R>, Dispatch<SetStateAction<Resource<R>>>] {
  const [res, setRes] = useState(initialRes);

  return [
    useMemo(() => withRefresh(res, () => setRes(res.reCreate())), [res]),
    setRes,
  ];
}
