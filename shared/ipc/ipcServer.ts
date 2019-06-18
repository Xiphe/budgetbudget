import { EventEmitter, Event } from 'electron';
import { Message, IdMessage, MessageHandlers, IpcError } from './types';
import createDebugger from 'debug';

type ReplyableEvent = Event & {
  reply: (channel: string, arg: any) => void;
};

function handle(
  message: Message,
  channel: string,
  handlers: { [key: string]: (payload: any) => any },
) {
  const [_, fn]: [string, any] = Object.entries(handlers).find(
    ([name]) => name === message.action,
  ) || ['nope', null];

  if (typeof fn !== 'function') {
    throw new Error(
      `Received unexpected message "${message.action}" on channel "${channel}"`,
    );
  }

  return fn(message.payload);
}

function error(err: IpcError, id: number) {
  return {
    ok: false,
    error: {
      message: err.message,
      code: err.code,
      retry: err.retry,
    },
    id,
  };
}

export default function ipcServer<M extends Message[]>(
  channel: string,
  emitter: EventEmitter,
  handlers: MessageHandlers<M[number]>,
) {
  const debug = createDebugger(`ipc:${channel}:server`);
  const reqChannel = `${channel}Req`;
  const resChannel = `${channel}Res`;
  const handler = async (event: ReplyableEvent, message: IdMessage) => {
    debug(`got request:`, message);
    try {
      const resp = {
        id: message.id,
        ok: true,
        response: await handle(message, channel, handlers),
      };
      event.reply(resChannel, resp);
      debug(`send response:`, message);
    } catch (err) {
      const e = error(err, message.id);
      event.reply(resChannel, e);
      debug(`send error:`, e);
    }
  };

  emitter.addListener(reqChannel, handler);
  debug('created');

  return () => {
    debug('removed');
    emitter.removeListener(reqChannel, handler);
  };
}
