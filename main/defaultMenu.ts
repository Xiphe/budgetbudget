import { Menu, app } from 'electron';
import {
  createMenu,
  createFileMenu,
  createOpenRecent,
} from '../src/shared/createMenu';
import { Settings } from '../src/shared/settings';
import { View } from '../src/shared/types';

export function createDefaultMenu(
  createWindow: (initialView: View) => void,
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
                  (file) => createWindow({ type: 'budget', file }),
                ),
                fileNew: () => createWindow({ type: 'new' }),
                fileOpen: openFile,
              }),
            ],
            {
              welcome: () => createWindow({ type: 'welcome' }),
            },
          ),
        ),
      );
    },
  };
}
