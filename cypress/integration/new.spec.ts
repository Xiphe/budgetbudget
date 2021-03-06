import { account, category } from '../factories';

describe('Create New Budget', () => {
  afterEach(() => {
    cy.checkTrailingHandlers();
  });

  it('creates a new budget files with options', () => {
    const accounts = [account(), account()];
    const categories = [category(), category(), category()];

    cy.open({
      waitUntilLoaded: false,
      ignoreChannels: [
        'UPDATE_LOCALE_COUNTRY_CODE',
        'FILE_EDITED',
        'SAVE_CANCELED',
        'UPDATE_COLOR_PREFERENCES',
        'UPDATE_SCHEME',
        'FOCUS',
        'BLUR',
      ],
      setup({ electron: { ipcMain } }) {
        ipcMain.handleOnce('INIT', () => ({ type: 'new' }));
        ipcMain.handleOnce('MM_EXPORT_ACCOUNTS', () => accounts);
        ipcMain.handleOnce('MM_EXPORT_CATEGORIES', () => categories);
        ipcMain.handleOnce('MM_EXPORT_TRANSACTIONS', () => []);
      },
    });

    cy.findByLabelText(/Name/i).type('My New Budget');
    cy.findByText(accounts[0].name).click();
    cy.bb().then(({ electron: { ipcMain } }) => {
      ipcMain.handleOnce('MM_EXPORT_TRANSACTIONS', () => []);
    });
    cy.findByLabelText(/Start Date/i).type('2019-07-07');
    cy.findByRole('button', { name: /choose income categories/i }).click();

    cy.findByText(/^\+$/).click();
    cy.findByDisplayValue(/please select/i).select(categories[1].name);

    cy.findByText(/Create "My New Budget"/i).click();
    cy.findByRole('region', { name: /July 2019/ }).should('be.visible');

    cy.bb().then(({ electron: { ipcMain } }) =>
      ipcMain.send('SAVE', '/my_new.budget'),
    );

    cy.readBudget('/my_new.budget')
      .should('include', {
        name: 'My New Budget',
        version: '0.0.4',
      })
      .and('deep.nested.include', {
        'settings.accounts': [accounts[0].uuid],
        'settings.startDate': 1562457600000,
        'settings.incomeCategories': [
          { id: categories[1].uuid, availableIn: 0 },
        ],
      });
  });

  it('supports refreshing MM data', () => {
    const accounts = [account(), account()];

    cy.open({
      waitUntilLoaded: false,
      ignoreChannels: [
        'UPDATE_LOCALE_COUNTRY_CODE',
        'FILE_EDITED',
        'SAVE_CANCELED',
        'UPDATE_COLOR_PREFERENCES',
        'UPDATE_SCHEME',
        'FOCUS',
        'BLUR',
      ],
      setup({ electron: { ipcMain } }) {
        ipcMain.handleOnce('INIT', () => ({ type: 'new' }));
        ipcMain.handleOnce('MM_EXPORT_ACCOUNTS', () => accounts);
      },
    });

    cy.findByText(accounts[0].name).should('be.visible');
    cy.findByText(accounts[1].name).should('be.visible');
    const newAccounts = [account()];
    cy.bb().then(({ electron: { ipcMain } }) => {
      ipcMain.handleOnce('MM_EXPORT_ACCOUNTS', () => newAccounts);
    });
    cy.clickMenu('File', 'Refresh MoneyMoney Data');
    cy.findByText(accounts[0].name).should('not.exist');
    cy.findByText(accounts[1].name).should('not.exist');
    cy.findByText(newAccounts[0].name).should('be.visible');
  });
});
