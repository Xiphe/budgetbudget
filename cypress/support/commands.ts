import '@testing-library/cypress/add-commands';
import 'cypress-wait-until';
import { IFs, Volume } from 'memfs';
import {
  Exposed as ExposedElectron,
  ExposedInternal,
} from '../../src/__mocks__/electron';
import { BudgetState, validateBudgetState } from '../../src/budget/Types';

type BBexposed = {
  electron: ExposedElectron;
  _electron: ExposedInternal;
  _startApp: () => void;
  fs: IFs;
  vol: typeof Volume;
};
type BB = Omit<BBexposed, '_electron' | '_startApp'>;
type OpenConfig = {
  setup?: (bb: BB) => void | Promise<void>;
  ignoreChannels: string[];
};

declare global {
  namespace Cypress {
    interface Chainable {
      open: (config: OpenConfig) => Cypress.Chainable<void>;
      cleanup: () => Cypress.Chainable<void>;
      bb: () => Cypress.Chainable<BB>;
      readBudget: (file: string) => Cypress.Chainable<BudgetState>;
    }
  }
}

function checkBB(win: any) {
  const { fs, vol, electron, _electron, _startApp } = win.__BB || {};
  return fs && vol && electron && _startApp && _electron;
}
Cypress.Commands.add('bb', () => {
  return cy.window().then((win: any) => {
    if (checkBB(win)) {
      return win.__BB;
    }

    return cy.waitUntil(() => checkBB(win)).then(() => win.__BB);
  });
});
Cypress.Commands.add('readBudget', (file: string) => {
  return cy
    .waitUntil(() => {
      return cy.bb().then(({ fs }) => {
        try {
          return JSON.parse(fs.readFileSync(file).toString());
        } catch (e) {
          return false;
        }
      });
    })
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
