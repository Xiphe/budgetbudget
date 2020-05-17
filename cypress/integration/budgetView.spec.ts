import {
  category,
  budget,
  transaction,
  transactions,
  settings,
} from '../factories';

describe('Budget View', () => {
  afterEach(() => {
    cy.cleanup();
  });

  it('displays correct overview values', () => {
    const incomeCategory = category({ name: 'Income this month' });
    const spendingCategory = category();
    const myBudget = budget({
      settings: settings({
        startBalance: 100,
        startDate: new Date('2019-07-31').getTime(),
        incomeCategories: [{ id: incomeCategory.uuid, availableIn: 0 }],
      }),
      budgets: {
        '2019-07': {
          categories: {
            [spendingCategory.uuid]: { amount: 1500 },
          },
        },
      },
    });

    const budgetFile = '/empty.budget';
    cy.open({
      ignoreChannels: [
        'FILE_EDITED',
        'SAVE_CANCELED',
        'UPDATE_COLOR_PREFERENCES',
        'UPDATE_SCHEME',
        'FOCUS',
        'SAVE',
        'BLUR',
      ],
      setup({ fs, electron: { ipcMain } }) {
        fs.writeFileSync(budgetFile, JSON.stringify(myBudget));
        ipcMain.handleOnce('INIT', () => budgetFile);
        ipcMain.handleOnce('MM_EXPORT_CATEGORIES', () => [
          incomeCategory,
          spendingCategory,
        ]);
        ipcMain.handleOnce('MM_EXPORT_TRANSACTIONS', () => {
          return transactions([
            transaction({
              bookingDate: new Date('2019-07-31'),
              categoryUuid: incomeCategory.uuid,
              amount: 3000,
            }),
            transaction({
              bookingDate: new Date('2019-07-31'),
              categoryUuid: spendingCategory.uuid,
              amount: -200,
            }),
          ]);
        });
      },
    });

    cy.findByRole('region', { name: /July 2019/ })
      .should('be.visible')
      .within(() => {
        cy.findAllByRole('listitem', {
          name: /3.100,00 Available Funds/i,
        }).should('be.visible');
        cy.findAllByRole('listitem', {
          name: /0,00 Overspend in Jun/i,
        }).should('be.visible');
        cy.findAllByRole('listitem', {
          name: /-1.500,00 Budgeted/i,
        }).should('be.visible');
        cy.findAllByRole('listitem', {
          name: /1.600,00 to Budget/i,
        }).should('be.visible');
      });
  });

  it('displays a monthly budget', () => {
    const someCategory = category();
    const myBudget = budget();

    const budgetFile = '/empty.budget';
    cy.open({
      ignoreChannels: [
        'FILE_EDITED',
        'SAVE_CANCELED',
        'UPDATE_COLOR_PREFERENCES',
        'UPDATE_SCHEME',
        'FOCUS',
        'SAVE',
        'BLUR',
      ],
      setup({ fs, electron: { ipcMain } }) {
        fs.writeFileSync(budgetFile, JSON.stringify(myBudget));
        ipcMain.handleOnce('INIT', () => budgetFile);
        ipcMain.handleOnce('MM_EXPORT_CATEGORIES', () => [someCategory]);
        ipcMain.handleOnce('MM_EXPORT_TRANSACTIONS', () =>
          transactions([transaction({ categoryUuid: someCategory.uuid })]),
        );
      },
    });

    cy.findByText(myBudget.name).should('be.visible');
  });
});
