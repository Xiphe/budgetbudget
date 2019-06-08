export type Message = {
  action: string;
  payload?: any;
  response?: any;
};

export type IdMessage = Message & {
  id: number;
};

export type MessageHandlers<M extends Message> = {
  [key in M['action']]: (
    payload: (Extract<M, { action: key }>)['payload'],
  ) => Promise<(Extract<M, { action: key }>)['response']>
};
