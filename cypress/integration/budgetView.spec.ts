import { category, budget, transaction, transactions } from '../factories';

describe('Budget View', () => {
  afterEach(() => {
    cy.cleanup();
  });

  it('displays a monthly budget', () => {
    const someCategory = category();
    const myBudget = budget();

    const budgetFile = '/empty.budget';
    cy.open({
      ignoreChannels: [
        'FILE_EDITED',
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
