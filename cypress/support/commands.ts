import '@testing-library/cypress/add-commands';
import 'cypress-wait-until';
import { IFs, Volume } from 'memfs';
import {
  Exposed as ExposedElectron,
  ExposedInternal,
  MenuTemplate,
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
  waitUntilLoaded?: boolean;
  ignoreChannels: string[];
};

declare global {
  namespace Cypress {
    interface Chainable<Subject = any> {
      open: (config: OpenConfig) => Cypress.Chainable<void>;
      checkTrailingHandlers: () => Cypress.Chainable<void>;
      bb: () => Cypress.Chainable<BB>;
      _bb: () => Cypress.Chainable<BBexposed>;
      clickMenu: (...path: string[]) => Cypress.Chainable<void>;
      readBudget: (file: string) => Cypress.Chainable<BudgetState>;
      categoryValue: (
        category: string,
        section: 'budgeted' | 'spend' | 'balance',
      ) => Cypress.Chainable<JQuery>;
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
  cy.window().waitUntil((win) => checkBB(win), {
    errorMsg: 'Could not find __BB on window',
  });
});
Cypress.Commands.add('_bb', () => {
  cy.bb();
});
Cypress.Commands.add('readBudget', (file: string) => {
  cy.bb()
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
Cypress.Commands.add('checkTrailingHandlers', () => {
  cy._bb().then(({ _electron }) => _electron.checkTrailingHandlers());
});
Cypress.Commands.add('categoryValue', (category, cell) => {
  return cy.findByRole('row', { name: category }).within(() => {
    return cy.findByRole('gridcell', { name: cell });
  });
});

Cypress.Commands.add('clickMenu', (...path) => {
  cy._bb().then(({ _electron }) => {
    const currentTemplate = _electron.getCurrentMenuTemplate();
    if (!currentTemplate) {
      throw new Error('Can not click Menu. No Menu has been set');
    }
    console.log(currentTemplate);
    let prevLabels: string[] = [];
    path
      .reduce(
        ({ submenu: currentMenu }: MenuTemplate[0], label): MenuTemplate[0] => {
          const title = prevLabels.concat(label).join(' | ');
          prevLabels.push(label);
          if (!currentMenu) {
            throw new Error(`MenuItem ${title} has no sub-menu`);
          }

          const items: MenuTemplate = Array.isArray(currentMenu)
            ? currentMenu
            : currentMenu.items;
          const item = items.find(({ label: l }) => label === l);

          if (!item) {
            throw new Error(`Can not find menuItem ${title}`);
          }

          if (!item.submenu && !item.enabled) {
            throw new Error(`MenuItem ${title} is disabled`);
          }

          return item;
        },
        { submenu: currentTemplate },
      )
      .click();
  });
});
Cypress.Commands.add(
  'open',
  ({ setup, ignoreChannels, waitUntilLoaded = true }) => {
    cy.visit('/');
    cy._bb().then(({ _electron }) => {
      _electron.ignoreChannels(ignoreChannels);
    });
    cy.bb().then(setup);
    cy._bb().then(({ _startApp }) => _startApp());
    if (waitUntilLoaded) {
      cy.findByText(/BudgetBudget - Loading/i).should('be.visible');
      cy.findByText(/BudgetBudget - Loading/i).should('not.be.visible');
    }
  },
);
