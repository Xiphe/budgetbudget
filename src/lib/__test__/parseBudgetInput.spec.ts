import subMonths from 'date-fns/subMonths';
import format from 'date-fns/format';
import parseBudgetInput, { ParseBudgetInputOpts } from '../parseBudgetInput';
import {
  createNumberFormatter,
  createCategoryRow,
  createMonthData,
} from './factories';

describe('parseBudgetInput', () => {
  const threeMonthsAgo = subMonths(new Date(), 3);
  const categoryId = '34qohdskldskl';
  const otherCategoryId = '123oujknsd';
  let opts: ParseBudgetInputOpts;

  beforeEach(() => {
    opts = {
      currentMonth: createMonthData(new Date(), {
        income: { amount: 100, transactions: [] },
        availableThisMonth: { amount: 200, transactions: [] },
        total: { budgeted: 9, spend: -3, balance: -6 },
        toBudget: 55,
        rollover: { total: -123 },
        uncategorized: { amount: -89, transactions: [] },
        categories: [
          createCategoryRow({
            budgeted: 1,
            spend: -3,
            balance: -2,
            uuid: categoryId,
          }),
          createCategoryRow({ budgeted: 3, name: 'wake' }),
          createCategoryRow({ budgeted: 5, uuid: otherCategoryId }),
        ],
      }),
      months: [
        createMonthData(threeMonthsAgo, {
          income: { amount: 200, transactions: [] },
          availableThisMonth: { amount: 300, transactions: [] },
          total: { budgeted: 84, spend: 0, balance: 0 },
          toBudget: 66,
          rollover: { total: -234 },
          uncategorized: { amount: -78, transactions: [] },
          categories: [
            createCategoryRow({ budgeted: 5, uuid: categoryId }),
            createCategoryRow({ budgeted: 79, name: 'asd' }),
          ],
        }),
        createMonthData(subMonths(new Date(), 2), {
          income: { amount: 300, transactions: [] },
          availableThisMonth: { amount: 100, transactions: [] },
          total: { budgeted: 30, spend: 0, balance: 0 },
          toBudget: 77,
          rollover: { total: -345 },
          uncategorized: { amount: -67, transactions: [] },
          categories: [
            createCategoryRow({ budgeted: 7, uuid: categoryId }),
            createCategoryRow({ budgeted: 23, name: 'asd' }),
          ],
        }),
        createMonthData(subMonths(new Date(), 1), {
          income: { amount: 400, transactions: [] },
          availableThisMonth: { amount: 200, transactions: [] },
          total: { budgeted: 15, spend: 0, balance: 0 },
          toBudget: 88,
          rollover: { total: -456 },
          uncategorized: { amount: -56, transactions: [] },
          categories: [
            createCategoryRow({ budgeted: 12, uuid: categoryId }),
            createCategoryRow({ budgeted: 3, name: 'asd' }),
          ],
        }),
      ],
      numberFormatter: createNumberFormatter(),
      categoryId,
    };
  });

  describe('basic inputs', () => {
    it('parses numbers using number-formatter', () => {
      opts.numberFormatter.parse = jest.fn(() => 123);
      opts.numberFormatter.delimiters = ['.', ','];

      expect(parseBudgetInput('1.000,5', opts)).toBe(123);
      expect(opts.numberFormatter.parse).toHaveBeenCalledWith('1.000,5');
    });

    it('parses numbers with strange delimiters and whitespace using number-formatter', () => {
      opts.numberFormatter.parse = jest.fn(() => 234);
      opts.numberFormatter.delimiters = ['@', '!'];
      expect(parseBudgetInput('1 @ 000 ! 5 ', opts)).toBe(234);
      expect(opts.numberFormatter.parse).toHaveBeenCalledWith('1 @ 000 ! 5 ');
    });

    it('ignores leading =', () => {
      /* can be used to disable live-updates */
      opts.numberFormatter.parse = jest.fn(() => 345);
      expect(parseBudgetInput('=345', opts)).toBe(345);
      expect(opts.numberFormatter.parse).toHaveBeenCalledWith('345');
    });
  });

  describe('simple calculations', () => {
    beforeEach(() => {
      opts.numberFormatter.parse = jest.fn((input) =>
        parseFloat(input.replace(/\./g, '').replace(',', '.')),
      );
    });

    it('formats numbers in calculation inputs', () => {
      expect(parseBudgetInput('1.000,5 + 5,5', opts)).toBe(1006);
    });

    it('calculates', () => {
      expect(parseBudgetInput('(7,5 + 5) * 8 / (5 - 1)', opts)).toBe(25);
    });
  });

  describe('for same month', () => {
    it('gets budgeted from current category in current month', () => {
      expect(parseBudgetInput('budgeted()', opts)).toBe(1);
    });

    it('gets spend from current category in current month', () => {
      expect(parseBudgetInput('spend()', opts)).toBe(3);
    });

    it('gets balance from current category in current month', () => {
      expect(parseBudgetInput('balance()', opts)).toBe(2);
    });

    it('gets budgeted from a different category in current month', () => {
      expect(parseBudgetInput(`budgeted('wake')`, opts)).toBe(3);
    });

    it('gets budgeted from a different category in current month by id', () => {
      expect(parseBudgetInput(`budgeted('${otherCategoryId}')`, opts)).toBe(5);
    });

    it('gets total butgeted', () => {
      expect(parseBudgetInput('budgeted(total)', opts)).toBe(9);
    });

    it('gets total spend', () => {
      expect(parseBudgetInput('spend(t)', opts)).toBe(3);
    });

    it('gets total balance', () => {
      expect(parseBudgetInput('balance(t)', opts)).toBe(6);
    });

    it('gets total available funds', () => {
      expect(parseBudgetInput('available()', opts)).toBe(200);
    });

    it('gets income', () => {
      expect(parseBudgetInput('income()', opts)).toBe(100);
    });

    it('gets toBudget', () => {
      expect(parseBudgetInput('toBudget()', opts)).toBe(55);
    });

    it('gets overspend', () => {
      expect(parseBudgetInput('overspend()', opts)).toBe(123);
    });

    it('gets uncategorized', () => {
      expect(parseBudgetInput('uncategorized()', opts)).toBe(89);
    });
  });

  describe('for specific month', () => {
    const monthKey = format(threeMonthsAgo, 'yyyy-MM');
    it('gets budgeted', () => {
      expect(parseBudgetInput(`budgeted('${monthKey}')`, opts)).toBe(5);
    });

    it('gets budgeted from different category', () => {
      expect(parseBudgetInput(`budgeted('asd', '${monthKey}')`, opts)).toBe(79);
    });

    it('gets budgeted from total', () => {
      expect(parseBudgetInput(`budgeted(t, '${monthKey}')`, opts)).toBe(84);
    });

    it('gets available funds', () => {
      expect(parseBudgetInput(`available('${monthKey}')`, opts)).toBe(300);
    });

    it('gets income', () => {
      expect(parseBudgetInput(`income('${monthKey}')`, opts)).toBe(200);
    });

    it('gets toBudget', () => {
      expect(parseBudgetInput(`toBudget('${monthKey}')`, opts)).toBe(66);
    });

    it('gets overspend', () => {
      expect(parseBudgetInput(`overspend('${monthKey}')`, opts)).toBe(234);
    });

    it('gets uncategorized', () => {
      expect(parseBudgetInput(`uncategorized('${monthKey}')`, opts)).toBe(78);
    });
  });

  describe('average of past months', () => {
    it('gets the average budgeted', () => {
      expect(parseBudgetInput(`budgeted(~2)`, opts)).toBe(9.5);
    });

    it('gets the average budgeted without non-existent', () => {
      expect(parseBudgetInput(`budgeted(~12)`, opts)).toBe(8);
    });

    it('gets the average budgeted from different category', () => {
      expect(parseBudgetInput(`budgeted('asd', ~2)`, opts)).toBe(13);
    });

    it('gets the average budgeted from different category without non-existent', () => {
      expect(parseBudgetInput(`budgeted('asd', ~12)`, opts)).toBe(35);
    });

    it('gets the average budgeted from total', () => {
      expect(parseBudgetInput(`budgeted(t, ~2)`, opts)).toBe(22.5);
    });

    it('gets the average budgeted from total without non-existent', () => {
      expect(parseBudgetInput(`budgeted(t, ~12)`, opts)).toBe(43);
    });

    it('gets the average available funds', () => {
      expect(parseBudgetInput(`available(~2)`, opts)).toBe(150);
    });

    it('gets the average available funds without non-existen', () => {
      expect(parseBudgetInput(`available(~12)`, opts)).toBe(200);
    });

    it('gets the average income', () => {
      expect(parseBudgetInput(`income(~2)`, opts)).toBe(350);
    });

    it('gets the average income without non-existen', () => {
      expect(parseBudgetInput(`income(~12)`, opts)).toBe(300);
    });

    it('gets the average toBudget', () => {
      expect(parseBudgetInput(`toBudget(~2)`, opts)).toBe(82.5);
    });

    it('gets the average toBudget without non-existen', () => {
      expect(parseBudgetInput(`toBudget(~12)`, opts)).toBe(77);
    });

    it('gets the average overspend', () => {
      expect(parseBudgetInput(`overspend(~2)`, opts)).toBe(400.5);
    });

    it('gets the average overspend without non-existen', () => {
      expect(parseBudgetInput(`overspend(~12)`, opts)).toBe(345);
    });

    it('gets the average uncategorized', () => {
      expect(parseBudgetInput(`uncategorized(~2)`, opts)).toBe(61.5);
    });

    it('gets the average uncategorized without non-existen', () => {
      expect(parseBudgetInput(`uncategorized(~12)`, opts)).toBe(67);
    });
  });

  describe('sum of past months', () => {
    it('gets the budgeted sum', () => {
      expect(parseBudgetInput(`budgeted(2)`, opts)).toBe(19);
    });

    it('gets the budgeted sum without non-existent', () => {
      expect(parseBudgetInput(`budgeted(12)`, opts)).toBe(24);
    });

    it('gets the budgeted sum from different category', () => {
      expect(parseBudgetInput(`budgeted('asd', 2)`, opts)).toBe(26);
    });

    it('gets the budgeted sum from different category without non-existent', () => {
      expect(parseBudgetInput(`budgeted('asd', 12)`, opts)).toBe(105);
    });

    it('gets the budgeted sum from total', () => {
      expect(parseBudgetInput(`budgeted(t, 2)`, opts)).toBe(45);
    });

    it('gets the budgeted sum from total without non-existent', () => {
      expect(parseBudgetInput(`budgeted(t, 12)`, opts)).toBe(129);
    });

    it('gets the available funds sum', () => {
      expect(parseBudgetInput(`available(2)`, opts)).toBe(300);
    });

    it('gets the available funds sum without non-existent', () => {
      expect(parseBudgetInput(`available(12)`, opts)).toBe(600);
    });

    it('gets the income sum', () => {
      expect(parseBudgetInput(`income(2)`, opts)).toBe(700);
    });

    it('gets the income sum without non-existent', () => {
      expect(parseBudgetInput(`income(12)`, opts)).toBe(900);
    });

    it('gets the toBudget sum', () => {
      expect(parseBudgetInput(`toBudget(2)`, opts)).toBe(165);
    });

    it('gets the toBudget sum without non-existen', () => {
      expect(parseBudgetInput(`toBudget(12)`, opts)).toBe(231);
    });

    it('gets the overspend sum', () => {
      expect(parseBudgetInput(`overspend(2)`, opts)).toBe(801);
    });

    it('gets the overspend sum without non-existen', () => {
      expect(parseBudgetInput(`overspend(12)`, opts)).toBe(1035);
    });

    it('gets the uncategorized sum', () => {
      expect(parseBudgetInput(`uncategorized(2)`, opts)).toBe(123);
    });

    it('gets the uncategorized sum without non-existen', () => {
      expect(parseBudgetInput(`uncategorized(12)`, opts)).toBe(201);
    });
  });

  describe('past month', () => {
    it('gets the budgeted', () => {
      expect(parseBudgetInput(`budgeted(-2)`, opts)).toBe(7);
    });

    it('defaults to 0 for budgeted of unexistent', () => {
      expect(parseBudgetInput(`budgeted(-12)`, opts)).toBe(0);
    });

    it('gets the budgeted from different category', () => {
      expect(parseBudgetInput(`budgeted('asd', -2)`, opts)).toBe(23);
    });

    it('defaults to 0 for budgeted of unexistent from different category', () => {
      expect(parseBudgetInput(`budgeted('asd', -12)`, opts)).toBe(0);
    });

    it('gets the budgeted from total', () => {
      expect(parseBudgetInput(`budgeted(t, -2)`, opts)).toBe(30);
    });

    it('defaults to 0 for budgeted of unexistent from total', () => {
      expect(parseBudgetInput(`budgeted(t, -12)`, opts)).toBe(0);
    });

    it('gets the available funds', () => {
      expect(parseBudgetInput(`available(-2)`, opts)).toBe(100);
    });

    it('defaults to 0 for available of unexistent funds', () => {
      expect(parseBudgetInput(`available(-12)`, opts)).toBe(0);
    });

    it('gets the income', () => {
      expect(parseBudgetInput(`income(-2)`, opts)).toBe(300);
    });

    it('defaults to 0 for income of unexistent', () => {
      expect(parseBudgetInput(`income(-12)`, opts)).toBe(0);
    });

    it('gets the toBudget', () => {
      expect(parseBudgetInput(`toBudget(-2)`, opts)).toBe(77);
    });

    it('defaults to 0 for toBudget of unexistent', () => {
      expect(parseBudgetInput(`toBudget(-12)`, opts)).toBe(0);
    });

    it('gets the overspend', () => {
      expect(parseBudgetInput(`overspend(-2)`, opts)).toBe(345);
    });

    it('defaults to 0 for overspend of unexistent', () => {
      expect(parseBudgetInput(`overspend(-12)`, opts)).toBe(0);
    });

    it('gets the uncategorized', () => {
      expect(parseBudgetInput(`uncategorized(-2)`, opts)).toBe(67);
    });

    it('defaults to 0 for uncategorized of unexistent', () => {
      expect(parseBudgetInput(`uncategorized(-12)`, opts)).toBe(0);
    });
  });
});
