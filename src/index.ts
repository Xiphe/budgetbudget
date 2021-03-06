import './shared/log';
import 'focus-visible';
import initTheme from './initTheme';

const appEntry = document.getElementById('root')!;
(async () => {
  if (process.env.REACT_APP_ENV === 'test') {
    appEntry.innerHTML = '<h1>Waiting for initiation.</h1>';
    const { default: expose } = await import('./__mocks__');
    await new Promise((res) => expose('_startApp', res));
    appEntry.innerHTML = '';
  }

  initTheme();

  const [
    { createElement },
    { unstable_createRoot },
    { default: App },
  ] = await Promise.all<
    typeof import('react'),
    any, // TODO: use real type once concurrent mode is stable typeof import('react-dom'),
    typeof import('./App')
  >([import('react'), import('react-dom'), import('./App')]);

  unstable_createRoot(appEntry).render(createElement(App));
})().catch((err) => {
  console.error(err);
  appEntry.innerHTML = `<div>
      <h1>Really really really unexpected Error:</h1>
      <p>${err.message}</p>
    </div>`;
});
