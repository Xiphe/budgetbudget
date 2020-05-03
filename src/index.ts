import 'focus-visible';
import initTheme from './initTheme';

initTheme();

Promise.all([
  import('react'),
  import('react-dom'),
  import('./App'),
  /* Delay app startup until test environment calls startApp */
  process.env.REACT_APP_ENV === 'test'
    ? import('./__mocks__/_expose.win').then(
        ({ default: expose }) => new Promise((res) => expose('startApp', res)),
      )
    : null,
] as any).then(([{ createElement }, { render }, { default: App }]: any) => {
  render(createElement(App), document.getElementById('root'));
});
