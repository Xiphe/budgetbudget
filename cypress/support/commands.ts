import '@testing-library/cypress/add-commands';
import 'cypress-wait-until';
import { IFs, Volume } from 'memfs';
import { Exposed as ExposedElectron } from '../../src/__mocks__/electron';

declare global {
  namespace Cypress {
    interface Chainable {
      BB: () => Cypress.Chainable<{
        electron: ExposedElectron;
        fs: IFs;
        vol: typeof Volume;
        startApp: () => void;
      }>;
    }
  }
}

Cypress.Commands.add('BB', () => {
  return cy.window().then((win: any) => {
    return cy
      .waitUntil(() => {
        const { fs, vol, electron, startApp } = win.__BB || {};
        return fs && vol && electron && startApp;
      })
      .then(() => win.__BB);
  });
});
