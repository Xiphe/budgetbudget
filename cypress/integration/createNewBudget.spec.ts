import { account, category } from '../factories';

describe('Create New Budget', () => {
  afterEach(() => {
    cy.BB().then(({ electron: { cleanup } }) => cleanup());
  });

  it('creates a new budget files with options', () => {
    const accounts = [account(), account()];
    const categories = [category(), category(), category()];
    cy.visit('/');
    cy.BB().then(({ startApp, electron: { ipcMain, ignoreChannel }, fs }) => {
      ignoreChannel(
        'FILE_EDITED',
        'UPDATE_COLOR_PREFERENCES',
        'UPDATE_SCHEME',
        'FOCUS',
        'BLUR',
      );
      ipcMain.handleOnce('INIT', () => undefined);
      ipcMain.handleOnce('MM_EXPORT_ACCOUNTS', () => accounts);
      ipcMain.handleOnce('MM_EXPORT_CATEGORIES', () => categories);
      ipcMain.handleOnce('MM_EXPORT_TRANSACTIONS', () => []);

      startApp();

      cy.findByText(/Ok, I understand. Create a new Budget/i).click();
      cy.findByLabelText(/Name/i).type('My New Budget');
      cy.findByText(accounts[0].name).click();
      cy.findByLabelText(/Number format/i)
        .type('{selectall}')
        .type('de-DE');
      cy.findByLabelText(/Start Date/i).type('2019-07-07');
      cy.findByText(/choose income categories/i).click();

      cy.findByText(/^\+$/).click();
      cy.findByText(/please select/i)
        .parent('select')
        .select(categories[1].name);

      cy.BB().then(({ electron: { ipcMain } }) => {
        ipcMain.once('SAVE_AS', () => {
          ipcMain.send('SAVE', '/my_new.budget');
        });
      });

      cy.findByText(/Create "My New Budget"/i).click();

      cy.waitUntil(() => {
        try {
          return JSON.parse(fs.readFileSync('/my_new.budget').toString());
        } catch (err) {
          return false;
        }
      }).then((file) => {
        expect(file.name).to.equal('My New Budget');
        expect(file.version).to.equal('0.0.2');
        expect(file.settings).to.be.an('object');
        expect(file.settings.accounts).to.deep.equal([accounts[0].uuid]);
        expect(file.settings.numberLocale).to.equal('de-DE');
        expect(file.settings.startDate).to.equal(1562457600000);
        expect(file.settings.incomeCategories).to.deep.equal([
          { id: categories[1].uuid, availableIn: 0 },
        ]);
      });
    });
  });
});
