import {
  category,
  budget,
  transaction,
  transactions,
  settings,
} from '../factories';

const COMMON_IGNORED_CHANNELS = [
  'FILE_EDITED',
  'SAVE_CANCELED',
  'UPDATE_COLOR_PREFERENCES',
  'UPDATE_SCHEME',
  'FOCUS',
  'SAVE',
  'BLUR',
];

describe('Budget View', () => {
  afterEach(() => {
    cy.checkTrailingHandlers();
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
      ignoreChannels: COMMON_IGNORED_CHANNELS,
      setup({ fs, electron: { ipcMain } }) {
        fs.writeFileSync(budgetFile, JSON.stringify(myBudget));
        ipcMain.handleOnce('INIT', () => ({
          type: 'budget',
          file: budgetFile,
        }));
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

  it.only('supports refreshing MM data', () => {
    const spendingCategory = category();
    const myBudget = budget({
      settings: settings({
        startDate: new Date('2019-07-31').getTime(),
      }),
    });
    const transaction1 = transaction({
      bookingDate: new Date(myBudget.settings.startDate + 1000),
      categoryUuid: spendingCategory.uuid,
      amount: 10,
    });
    const transaction2 = transaction({
      bookingDate: new Date(myBudget.settings.startDate + 1000),
      categoryUuid: spendingCategory.uuid,
      amount: 20,
    });

    const budgetFile = '/empty.budget';
    cy.open({
      ignoreChannels: COMMON_IGNORED_CHANNELS,
      setup({ fs, electron: { ipcMain } }) {
        fs.writeFileSync(budgetFile, JSON.stringify(myBudget));
        ipcMain.handleOnce('INIT', () => ({
          type: 'budget',
          file: budgetFile,
        }));
        ipcMain.handleOnce('MM_EXPORT_CATEGORIES', () => [spendingCategory]);
        ipcMain.handleOnce('MM_EXPORT_TRANSACTIONS', () =>
          transactions([transaction1]),
        );
      },
    });

    cy.findByRole('region', { name: /July 2019/ })
      .should('be.visible')
      .within(() => {
        cy.categoryValue(spendingCategory.name, 'spend').should(
          'have.text',
          '10,00',
        );
      });
    cy.bb().then(({ electron: { ipcMain } }) => {
      ipcMain.handleOnce('MM_EXPORT_CATEGORIES', () => [spendingCategory]);
      ipcMain.handleOnce('MM_EXPORT_TRANSACTIONS', () =>
        transactions([transaction1, transaction2]),
      );
    });
    cy.clickMenu('File', 'Refresh MoneyMoney Data');

    cy.findByRole('region', { name: /July 2019/ }).within(() => {
      cy.categoryValue(spendingCategory.name, 'spend').should(
        'have.text',
        '30,00',
      );
    });
  });
});
