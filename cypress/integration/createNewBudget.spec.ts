describe('Categories', () => {
  let categories: any;
  let accounts: any;
  beforeEach(() => {
    cy.fixture('basic-categories.json').then((c) => (categories = c));
    cy.fixture('empty-accounts.json').then((a) => (accounts = a));
  });

  it('tests', () => {
    cy.visit('/');
    cy.BB().then(({ startApp, electron: { ipcMain }, fs }) => {
      ipcMain.handleOnce('INIT', () => undefined);
      ipcMain.handleOnce('MM_EXPORT_ACCOUNTS', () => accounts);
      ipcMain.handleOnce('MM_EXPORT_CATEGORIES', () => categories);

      startApp();

      cy.findByText(/Ok, I understand. Create a new Budget/i).click();
      cy.findByLabelText(/Name/i).type('My New Budget');
      cy.findByText(/Some Account/i).click();
      cy.findByLabelText(/Number format/i)
        .type('{selectall}')
        .type('de-DE');
      cy.findByLabelText(/Start Date/i).type('2019-07-07');
      cy.findByText(/choose income categories/i).click();

      cy.findByText(/^\+$/).click();
      cy.findByText(/please select/i)
        .parent('select')
        .select('Sale of fruit');

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
        expect(file.settings.accounts).to.deep.equal([
          'de1b0787-ec69-442f-8883-0057a21abd3d',
        ]);
        expect(file.settings.numberLocale).to.equal('de-DE');
        expect(file.settings.startDate).to.equal(1562457600000);
        expect(file.settings.incomeCategories).to.deep.equal([
          { id: '65e2e6c4-c821-4485-87c8-230f0e4f23bf', availableIn: 0 },
        ]);
      });
    });
  });
});
