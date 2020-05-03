import { remote, ipcRenderer } from 'electron';

const { nativeTheme, systemPreferences } = remote;

function setColors() {
  const accentColorHex = systemPreferences.getAccentColor();
  const highlightColors = `${(
    systemPreferences.getUserDefault('AppleHighlightColor', 'string') ||
    '9 92 220'
  )
    .split(' ')
    .slice(0, 3)
    .map((i: string) => Math.round(Number(i) * 255))
    .join(', ')}`;
  const accentColors = [
    parseInt(accentColorHex.substring(0, 2), 16),
    parseInt(accentColorHex.substring(2, 4), 16),
    parseInt(accentColorHex.substring(4, 6), 16),
  ].join(', ');

  document.querySelector(
    'html',
  )!.style.cssText = `--highlight-colors: ${highlightColors}; --accent-colors: ${accentColors};`;
}

function setScheme() {
  const { shouldUseDarkColors, shouldUseHighContrastColors } = nativeTheme;
  document.querySelector('html')!.dataset.theme = [
    shouldUseDarkColors ? 'dark' : 'light',
    shouldUseHighContrastColors && 'high-contrast',
  ]
    .filter(Boolean)
    .join('-');
}

export default function initTheme() {
  if (process.env.REACT_APP_ENV === 'test') {
    document.querySelector('html')!.classList.add('env-test');
  }
  setScheme();
  setColors();
  ipcRenderer.on('UPDATE_COLOR_PREFERENCES', setColors);
  ipcRenderer.on('UPDATE_SCHEME', setScheme);
}
