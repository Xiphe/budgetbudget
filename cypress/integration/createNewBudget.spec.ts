import { account, category } from '../factories';

describe('Create New Budget', () => {
  afterEach(() => {
    cy.cleanup();
  });

  it('creates a new budget files with options', () => {
    const accounts = [account(), account()];
    const categories = [category(), category(), category()];

    cy.open({
      ignoreChannels: [
        'FILE_EDITED',
        'UPDATE_COLOR_PREFERENCES',
        'UPDATE_SCHEME',
        'FOCUS',
        'BLUR',
      ],
      setup({ electron: { ipcMain } }) {
        ipcMain.handleOnce('INIT', () => undefined);
        ipcMain.handleOnce('MM_EXPORT_ACCOUNTS', () => accounts);
        ipcMain.handleOnce('MM_EXPORT_CATEGORIES', () => categories);
      },
    });

    cy.findByRole('button', {
      name: /Ok, I understand. Create a new Budget/i,
    }).click();
    cy.findByLabelText(/Name/i).type('My New Budget');
    cy.findByText(accounts[0].name).click();
    cy.findByLabelText(/Number format/i)
      .type('{selectall}')
      .type('de-DE');
    cy.findByLabelText(/Start Date/i).type('2019-07-07');
    cy.findByRole('button', { name: /choose income categories/i }).click();

    cy.findByText(/^\+$/).click();
    cy.findByDisplayValue(/please select/i).select(categories[1].name);

    cy.bb().then(({ electron: { ipcMain } }) => {
      ipcMain.once('SAVE_AS', () => {
        ipcMain.send('SAVE', '/my_new.budget');
      });
      ipcMain.handleOnce('MM_EXPORT_CATEGORIES', () => []);
      ipcMain.handleOnce('MM_EXPORT_TRANSACTIONS', () => []);
    });

    cy.findByText(/Create "My New Budget"/i).click();

    cy.readBudget('/my_new.budget').then(({ name, version, settings }) => {
      expect(name).to.equal('My New Budget');
      expect(version).to.equal('0.0.2');
      expect(settings).to.be.an('object');
      expect(settings.accounts).to.deep.equal([accounts[0].uuid]);
      expect(settings.numberLocale).to.equal('de-DE');
      expect(settings.startDate).to.equal(1562457600000);
      expect(settings.incomeCategories).to.deep.equal([
        { id: categories[1].uuid, availableIn: 0 },
      ]);
    });
  });
});
