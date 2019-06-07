import { BrowserWindow } from 'electron';

const DEFAULT_WINDOW_CONFIG = {
  width: 800,
  height: 600,
};

export default class WindowManager {
  private entry: string;
  private windows: BrowserWindow[] = [];
  constructor(entry: string) {
    this.entry = entry;
  }

  new = () => {
    const window: BrowserWindow = new BrowserWindow(DEFAULT_WINDOW_CONFIG);
    this.windows.push(window);
    window.loadURL(this.entry);
    window.on('closed', () => {
      this.windows.splice(this.windows.indexOf(window), 1);
    });
  };

  activate = () => {
    if (this.windows.length === 0) {
      this.new();
    }
  };
}
