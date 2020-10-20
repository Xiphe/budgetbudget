import { MenuItem, MenuItemConstructorOptions, Remote } from 'electron';
import expose from './_expose.win';

const TEMPLATE = Symbol('TEMPLATE');
export type MenuTemplate = (MenuItemConstructorOptions | MenuItem)[];
type Menu<T> = {
  [TEMPLATE]: T;
  getMenuItemById: (id: string) => { enabled: boolean };
};
type PartialRemote = {
  app: Pick<Remote['app'], 'name' | 'getPath' | 'getLocaleCountryCode'>;
  systemPreferences: Pick<
    Remote['systemPreferences'],
    'getAccentColor' | 'getUserDefault'
  >;
  nativeTheme: Pick<
    Remote['nativeTheme'],
    'shouldUseDarkColors' | 'shouldUseHighContrastColors'
  >;
  Menu: {
    setApplicationMenu: (menu: Menu<MenuTemplate>) => void;
    buildFromTemplate: <T extends MenuTemplate>(template: T) => Menu<T>;
  };
};
let currentMenuTemplate: MenuTemplate | null = null;
const remote: PartialRemote = {
  app: {
    name: 'Mocked BB',
    getPath(name: string) {
      return `/_appPath/${name}`;
    },
    getLocaleCountryCode() {
      return 'DE';
    },
  },
  systemPreferences: {
    getAccentColor() {
      return 'ff00ff';
    },
    getUserDefault(key: string) {
      if (key === 'AppleHighlightColor') {
        return '9 92 220';
      }
    },
  },
  nativeTheme: {
    shouldUseDarkColors: true,
    shouldUseHighContrastColors: false,
  },
  Menu: {
    setApplicationMenu({ [TEMPLATE]: template }) {
      currentMenuTemplate = template;
    },
    buildFromTemplate: (template) => ({
      [TEMPLATE]: template,
      getMenuItemById: (id: string) => ({ enabled: false }),
    }),
  },
};

const ignoredChannels: string[] = [];
type Handler = (...args: any[]) => any;
function createHandler(name: string) {
  let handlers: {
    [channel: string]: Handler[];
  } = {};

  function invoke(channel: string, ...args: any[]) {
    if (ignoredChannels.includes(channel)) {
      return;
    }
    const handler = (handlers[channel] || []).shift();

    if (!handler) {
      throw new Error(
        `Unexpected invocation of channel "${channel}" on ${name} with args: ${JSON.stringify(
          args,
        )}`,
      );
    }

    return handler(...args);
  }

  return {
    checkTrailingHandlers() {
      const errors = Object.entries(handlers)
        .map(([channel, hs]) => {
          if (hs.length) {
            return `${hs.length} trailing handlers for channel "${channel}" on ${name}`;
          }
          return null;
        })
        .filter((v: null | string): v is string => v !== null);

      if (errors.length) {
        throw new Error(errors.join('\n'));
      }
    },
    add(channel: string, handler: Handler) {
      if (ignoredChannels.includes(channel)) {
        return;
      }
      if (!handlers[channel]) {
        handlers[channel] = [];
      }
      handlers[channel].push(handler);
    },
    remove(channel: string, handler: Handler) {
      if (ignoredChannels.includes(channel)) {
        return;
      }
      const i = (handlers[channel] || []).indexOf(handler);
      if (i === -1) {
        throw new Error(
          `Can not remove unknown handler "${handler.name}" from channel "${channel}" on ${name}`,
        );
      }
      handlers[channel].splice(i, 1);
    },
    send(channel: string, ...args: any[]) {
      invoke(channel, Symbol('FAKE_EVENT'), ...args);
    },
    async invoke(channel: string, ...args: any[]) {
      return invoke(channel, ...args);
    },
  };
}

const invokeHandlers = createHandler('invoke');
const rendererEvents = createHandler('renderer');
const mainEvents = createHandler('main');
const ipcRenderer = {
  on: rendererEvents.add,
  off: rendererEvents.remove,
  send: mainEvents.send,
  invoke: invokeHandlers.invoke,
};
const ipcMain = {
  once: mainEvents.add,
  send: rendererEvents.send,
  handleOnce: invokeHandlers.add,
};

function ignoreChannels(channels: string[]) {
  channels.forEach((c) => {
    ignoredChannels.push(c);
  });
}

function checkTrailingHandlers() {
  invokeHandlers.checkTrailingHandlers();
  rendererEvents.checkTrailingHandlers();
  mainEvents.checkTrailingHandlers();
}

function getCurrentMenuTemplate() {
  return currentMenuTemplate;
}

export type Exposed = {
  ipcMain: typeof ipcMain;
  remote: PartialRemote;
};
export type ExposedInternal = {
  checkTrailingHandlers: typeof checkTrailingHandlers;
  ignoreChannels: typeof ignoreChannels;
  getCurrentMenuTemplate: typeof getCurrentMenuTemplate;
};
expose<Exposed>('electron', { ipcMain, remote });
expose<ExposedInternal>('_electron', {
  ignoreChannels,
  getCurrentMenuTemplate,
  checkTrailingHandlers,
});

export { ipcRenderer, remote };
