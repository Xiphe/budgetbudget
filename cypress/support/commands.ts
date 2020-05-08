import '@testing-library/cypress/add-commands';
import 'cypress-wait-until';
import { IFs, Volume } from 'memfs';
import {
  Exposed as ExposedElectron,
  ExposedInternal,
} from '../../src/__mocks__/electron';
import { BudgetState, validateBudgetState } from '../../src/budget/Types';

type BB = {
  electron: ExposedElectron;
  fs: IFs;
  vol: typeof Volume;
};
type BBexposed = BB & {
  _electron: ExposedInternal;
  _startApp: () => void;
};
type OpenConfig = {
  setup?: (bb: BB) => void | Promise<void>;
  ignoreChannels: string[];
};

declare global {
  namespace Cypress {
    interface Chainable<Subject = any> {
      open: (config: OpenConfig) => Cypress.Chainable<void>;
      cleanup: () => Cypress.Chainable<void>;
      bb: () => Cypress.Chainable<BB>;
      readBudget: (file: string) => Cypress.Chainable<BudgetState>;
      waitUntil<NewSubject>(
        checkFunction: (
          subject: Subject,
        ) => NewSubject | Chainable<NewSubject> | Promise<NewSubject>,
        options?: WaitUntilOptions,
      ): Chainable<NewSubject>;
    }
  }
}

function checkBB(win: any) {
  const { fs, vol, electron, _electron, _startApp } = win.__BB || {};
  const loaded = Boolean(fs && vol && electron && _startApp && _electron);

  return loaded && win.__BB;
}
Cypress.Commands.add('bb', () => {
  return cy.window().waitUntil((win) => checkBB(win), {
    errorMsg: 'Could not find __BB on window',
  });
});
Cypress.Commands.add('readBudget', (file: string) => {
  return cy
    .bb()
    .waitUntil(
      ({ fs }) => {
        try {
          return JSON.parse(fs.readFileSync(file).toString());
        } catch (e) {
          return false;
        }
      },
      {
        errorMsg: `Could not open budget ${file}`,
      },
    )
    .then((data) => validateBudgetState(data));
});
Cypress.Commands.add('cleanup', () => {
  return cy.bb().then((bb: any) => (bb as BBexposed)._electron.cleanup());
});
Cypress.Commands.add('open', ({ setup, ignoreChannels }) => {
  cy.visit('/');
  return cy.bb().then(async (bbexp: any) => {
    const bb: BBexposed = bbexp;
    bb._electron.ignoreChannels(ignoreChannels);
    await setup(bb);
    bb._startApp();
  });
});
