import 'focus-visible';
import initTheme from './initTheme';
import { InitRes } from './budget/getInitData';

async function getInitialInitResource() {
  return (await import('./budget/getInitData')).default();
}

const appEntry = document.getElementById('root')!;
(async () => {
  if (process.env.REACT_APP_ENV === 'test') {
    const { default: expose } = await import('./__mocks__');
    await new Promise((res) => expose('_startApp', res));
  }

  initTheme();

  const [
    initialInitRes,
    { createElement },
    { unstable_createRoot },
    { default: App },
  ] = await Promise.all<
    InitRes,
    typeof import('react'),
    any, // TODO: use real type once concurrent mode is stable typeof import('react-dom'),
    typeof import('./App')
  >([
    getInitialInitResource(),
    import('react'),
    import('react-dom'),
    import('./App'),
  ]);

  unstable_createRoot(appEntry).render(createElement(App, { initialInitRes }));
})().catch((err) => {
  console.error(err);
  appEntry.innerHTML = `<div>
      <h1>Really really really unexpected Error:</h1>
      <p>${err.message}</p>
    </div>`;
});
