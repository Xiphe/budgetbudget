export type Message = {
  action: string;
  payload?: any;
  response?: any;
};

export type RetryHandler = (err: RetryError) => () => void;

export type IpcError = Error & {
  retry?: boolean;
  code?: string | number;
  attempts?: number;
};

export type RetryError = Error & {
  code?: string | number;
  attempts?: number;
  retry: () => void;
  cancel: () => void;
};

export type IdMessage = Message & {
  id: number;
};

export type MessageHandlers<M extends Message> = {
  [key in M['action']]: (
    payload: (Extract<M, { action: key }>)['payload'],
  ) => Promise<(Extract<M, { action: key }>)['response']>
};
