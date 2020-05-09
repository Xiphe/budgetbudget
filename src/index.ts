import 'focus-visible';
import initTheme from './initTheme';

(process.env.REACT_APP_ENV === 'test'
  ? /* Delay app startup until test environment calls startApp */
    import('./__mocks__').then(({ default: expose }) => {
      return new Promise((res) => expose('_startApp', res));
    })
  : /* Non-ticking Promise.resolve() */
    { then: (cb: () => any) => cb() }
)
  .then(() => {
    initTheme();

    return Promise.all([
      import('react'),
      import('react-dom'),
      import('./App'),
    ] as any);
  })
  .then(
    ([{ createElement }, { unstable_createRoot }, { default: App }]: any) => {
      unstable_createRoot(document.getElementById('root')).render(
        createElement(App),
      );
    },
  );
