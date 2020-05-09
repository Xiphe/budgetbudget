export default function createResource<R>(get: () => Promise<R>) {
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
