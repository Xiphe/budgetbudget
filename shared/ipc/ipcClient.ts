import { EventEmitter, Event } from 'electron';
import {
  Message,
  IdMessage,
  MessageHandlers,
  IpcError,
  RetryHandler,
  RetryError,
} from './types';
import createDebugger from 'debug';

type ActionType<T> = T extends Message ? T['action'] : never;
type ActionTypes<T extends Message[]> = { [P in keyof T]: ActionType<T[P]> };

type OkMessage = Pick<IdMessage, 'id' | 'response' | 'action'> & {
  ok: true;
};
type ErrorMessage = Pick<IdMessage, 'id' | 'action'> & {
  ok: false;
  error: IpcError;
};
type ResponseMessage = OkMessage | ErrorMessage;
type Sender = (channel: string, message: IdMessage) => void;
type Queue = {
  [key: number]: {
    (err: IpcError | null, response?: any): void;
    attempts?: number;
    retry?: () => void;
  };
};

let i = 0;

function listen(
  channel: string,
  emitter: EventEmitter,
  queue: Queue,
  debug: ReturnType<typeof createDebugger>,
  { maxRetries = 3 }: { maxRetries?: number } = {},
) {
  const resChannel = `${channel}Res`;
  const handler = (event: Event, r: ResponseMessage) => {
    if (!queue[r.id]) {
      throw new Error(
        `Unexpected Message ${r.id} for action ${
          r.action
        } on channel ${channel}`,
      );
    }

    if (!r.ok) {
      debug('got error', r);
      if (r.error.retry && (queue[r.id].attempts || 0) < maxRetries) {
        queue[r.id].attempts = (queue[r.id].attempts || 0) + 1;
        debug('retrying: ', queue[r.id].attempts, 'of', maxRetries);
        setTimeout(() => {
          queue[r.id].retry!();
        }, queue[r.id].attempts! * 300);
        return;
      }

      const e: IpcError = new Error(r.error.message);
      e.code = r.error.code;
      if (r.error.retry) {
        e.retry = true;
        e.attempts = maxRetries;
      }
      queue[r.id](e);
    } else {
      debug('got response', r);
      queue[r.id](null, r.response);
    }
  };

  debug('listening');
  emitter.addListener(resChannel, handler);

  return () => {
    if (Object.keys(queue).length === 0) {
      emitter.removeListener(resChannel, handler);
      debug('stopped listening');
      return false;
    }
    return true;
  };
}

export default function ipcClient<M extends Message[]>(
  channel: string,
  emitter: EventEmitter,
  send: Sender,
  actions: Readonly<ActionTypes<M>>,
  retryHandler?: RetryHandler,
) {
  const debug = createDebugger(`ipc:${channel}:client`);
  const queue: Queue = {};
  let active = false;
  let stopListening: () => boolean;
  const tryListen = () => {
    if (!active) {
      stopListening = listen(channel, emitter, queue, debug);
      active = true;
    }
  };

  const client = actions.reduce(
    (memo, action): MessageHandlers<M[number]> => {
      memo[action] = (payload: any) => {
        return new Promise((resolve, reject) => {
          const id = i++;
          queue[id] = (err: IpcError | null, response) => {
            delete queue[id];
            active = stopListening();
            if (!err) {
              return resolve(response);
            }

            if (err.retry && retryHandler) {
              const retryErr: RetryError = err as any;
              retryErr.retry = () => {
                memo[action](payload).then(resolve, reject);
              };
              retryErr.cancel = () => {
                reject(err);
              };
              return retryHandler(retryErr);
            }

            reject(err);
          };
          const message = { id, action, payload };
          const trySend = () => {
            tryListen();
            send(`${channel}Req`, message);
          };
          queue[id].retry = trySend;
          trySend();
          debug('send request', message);
        });
      };

      return memo;
    },
    {} as any,
  ) as MessageHandlers<M[number]>;

  debug('created');
  return client;
}
