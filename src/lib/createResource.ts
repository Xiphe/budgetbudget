import { Dispatch, SetStateAction } from 'react';
type Read<T> = () => T;
export type Resource<T, Q = T> = {
  read: () => T;
  recreate: () => Resource<Q>;
};
type HigherOrderRead<T, Q = T> = (res: Resource<T>) => Read<Q>;

type CreateResOptions = {
  lazy?: boolean;
};
export default function createResource<R>(
  p: () => Promise<R>,
  options: CreateResOptions = {},
): Resource<R> {
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

  if (!options.lazy) {
    suspender = p().then(onSuccess, onError);
  }

  return {
    recreate() {
      return createResource(p, options);
    },
    read() {
      switch (status) {
        case 'pending':
          if (suspender === null) {
            suspender = p().then(onSuccess, onError);
          }
          throw suspender;
        case 'error':
          throw error;
        case 'success':
          return result;
      }
    },
  };
}

export function createHOR<R, Q>(
  res: Resource<R>,
  hor: HigherOrderRead<R, Q>,
): Resource<Q, R> {
  return {
    read: hor(res),
    recreate: res.recreate,
  };
}

export function withRetry<R>(
  setNewRes: Dispatch<SetStateAction<Resource<R>>>,
): HigherOrderRead<R> {
  return (res) => () => {
    try {
      return res.read();
    } catch (e) {
      if (e instanceof Error) {
        throw Object.assign(e, {
          retry() {
            setNewRes(res.recreate());
          },
        });
      }
      throw e;
    }
  };
}
