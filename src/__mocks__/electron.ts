import createIPCMock from 'electron-mock-ipc';
import { IpcMain, Remote, IpcRenderer } from 'electron';
import expose from './_expose.win';

const { ipcRenderer, ipcMain } = createIPCMock();

type PartialRemote = {
  app: Pick<Remote['app'], 'name' | 'getPath' | 'getLocale'>;
  systemPreferences: Pick<
    Remote['systemPreferences'],
    'getAccentColor' | 'getUserDefault'
  >;
  nativeTheme: Pick<
    Remote['nativeTheme'],
    'shouldUseDarkColors' | 'shouldUseHighContrastColors'
  >;
  Menu: Pick<Remote['Menu'], 'setApplicationMenu'> & {
    buildFromTemplate: () => {
      getMenuItemById: (id: string) => { enabled: boolean };
    };
  };
};
const remote: PartialRemote = {
  app: {
    name: 'Mocked BB',
    getPath(name: string) {
      return `/_appPath/${name}`;
    },
    getLocale() {
      return 'en-GB';
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
    setApplicationMenu() {},
    buildFromTemplate: () => ({
      getMenuItemById: (id: string) => ({ enabled: false }),
    }),
  },
};

// const ipcRendererEmitter = new EventEmitter();
// const pendingInvocations: {
//   [key: string]: {
//     args: any[];
//     resolve: (arg: any) => void;
//     reject: (err: Error) => void;
//   }[];
// } = {};
// const ipcRenderer = {
//   on: ipcRendererEmitter.on.bind(ipcRendererEmitter),
//   off: ipcRendererEmitter.off.bind(ipcRendererEmitter),
//   async invoke(channel: string, ...args: any[]) {
//     if (!pendingInvocations[channel]) {
//       pendingInvocations[channel] = [];
//     }

//     return new Promise((resolve, reject) => {
//       // const
//       pendingInvocations[channel].push({
//         args,
//         resolve,
//         reject,
//       });
//     });
//   },
// };

export type Exposed = {
  ipcMain: IpcMain & Pick<IpcRenderer, 'send'>;
  remote: PartialRemote;
};
expose<Exposed>('electron', { ipcMain, remote });
// expose('pendingInvocations', pendingInvocations);

export { ipcRenderer, remote };
