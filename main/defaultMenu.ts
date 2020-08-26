import { Menu, app } from 'electron';
import {
  createMenu,
  createFileMenu,
  createOpenRecent,
} from '../src/shared/createMenu';
import { Settings } from '../src/shared/settings';

export function createDefaultMenu(
  createWindow: (file?: string, hash?: string) => void,
  openFile: () => void,
  settings: Settings,
) {
  return {
    activate() {
      Menu.setApplicationMenu(
        Menu.buildFromTemplate(
          createMenu(
            app.name,
            [
              createFileMenu({
                openRecent: createOpenRecent(
                  settings.getRecentFiles(),
                  createWindow,
                ),
                fileNew: () => createWindow(undefined, 'new'),
                fileOpen: openFile,
              }),
            ],
            {
              welcome: () => createWindow(undefined),
            },
          ),
        ),
      );
    },
  };
}
