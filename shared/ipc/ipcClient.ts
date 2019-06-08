import { EventEmitter, Event } from 'electron';
import { Message, IdMessage, MessageHandlers } from './types';
import createDebugger from 'debug';

type ActionType<T> = T extends Message ? T['action'] : never;
type ActionTypes<T extends Message[]> = { [P in keyof T]: ActionType<T[P]> };

type OkMessage = Pick<IdMessage, 'id' | 'response' | 'action'> & {
  ok: true;
};
type ErrorMessage = Pick<IdMessage, 'id' | 'action'> & {
  ok: false;
  error: Error;
};
type ResponseMessage = OkMessage | ErrorMessage;

type Queue = {
  [key: number]: (err: Error | null, response?: any) => void;
};

let i = 0;

function listen(
  channel: string,
  emitter: EventEmitter,
  queue: Queue,
  debug: ReturnType<typeof createDebugger>,
) {
  const resChannel = `${channel}Res`;
  const handler = (event: Event, r: ResponseMessage) => {
    debug('got response', r);
    if (!queue[r.id]) {
      throw new Error(
        `Unexpected Message ${r.id} for action ${
          r.action
        } on channel ${channel}`,
      );
    }

    if (!r.ok) {
      queue[r.id](r.error);
    } else {
      queue[r.id](null, r.response);
    }
  };

  debug('listening');
  emitter.addListener(resChannel, handler);

  return () => {
    if (Object.keys(queue).length === 0) {
      emitter.removeListener(resChannel, handler);
      debug('stopped listening');
      return true;
    }
    return false;
  };
}

export default function ipcClient<M extends Message[]>(
  channel: string,
  emitter: EventEmitter,
  send: (channel: string, message: IdMessage) => void,
  actions: Readonly<ActionTypes<M>>,
) {
  const debug = createDebugger(`ipc:${channel}:client`);
  const queue: Queue = {};
  let active = false;
  let stopListening: () => boolean;

  const client = actions.reduce(
    (memo, action): MessageHandlers<M[number]> => {
      memo[action] = (payload: any) => {
        return new Promise((resolve, reject) => {
          if (!active) {
            stopListening = listen(channel, emitter, queue, debug);
            active = true;
          }
          const id = i++;
          const message = { id, action, payload };
          send(`${channel}Req`, message);
          debug('send request', message);
          queue[id] = (err, response) => {
            delete queue[id];
            active = stopListening();
            return err ? reject(err) : resolve(response);
          };
        });
      };

      return memo;
    },
    {} as any,
  ) as MessageHandlers<M[number]>;

  debug('created');
  return client;
}
