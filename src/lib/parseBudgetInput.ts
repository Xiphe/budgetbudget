import { DetailedMonthData } from '../budget';
import { MonthData } from '../budget/Types';
import isBefore from 'date-fns/isBefore';
import parseISO from 'date-fns/parseISO';
import isSameMonth from 'date-fns/isSameMonth';
import { Parser } from 'expr-eval';
import { NumberFormatter } from './createNumberFormatter';

const EMPTY_BUDGET_ROW = {
  budgeted: 0,
  spend: 0,
  balance: 0,
};

export function getCatByInput(
  detailedMonthData: DetailedMonthData | undefined,
  catInput: string,
) {
  if (!detailedMonthData) {
    return EMPTY_BUDGET_ROW;
  }
  if (catInput === total) {
    return detailedMonthData.total;
  }

  return (
    detailedMonthData.categories.find(({ uuid, name }) =>
      [uuid, name].includes(catInput),
    ) || EMPTY_BUDGET_ROW
  );
}

const total = '__TOTAL__';
const MIT_CURRENT_MONTH = '__MIT_CURRENT_MONTH__';
const MIT_DATE = '__MIT_DATE__';
const MIT_AVERAGE = '__MIT_AVERAGE__';
const MIT_SUM = '__MIT_SUM__';
const MIT_PAST = '__MIT_PAST__';

type AverageInput = [typeof MIT_AVERAGE, number];
type InputValue = string | number | undefined | AverageInput;
type ParsedMonthInput =
  | [typeof MIT_CURRENT_MONTH]
  | [typeof MIT_DATE, Date]
  | [typeof MIT_SUM, number]
  | [typeof MIT_PAST, number]
  | AverageInput;

function isAverageInput(input: InputValue): input is AverageInput {
  return (
    Array.isArray(input) &&
    input.length === 2 &&
    input[0] === MIT_AVERAGE &&
    typeof input[1] === 'number'
  );
}

export const DATE_INPUT_RGX = /^[0-9]{4}-[0-9]{1,2}$/;
function normalizeInputs(
  catInput: InputValue,
  monthInput: InputValue,
  categoryId: string,
): [string, ParsedMonthInput] {
  if (
    catInput !== undefined &&
    (typeof catInput === 'number' ||
      isAverageInput(catInput) ||
      catInput.match(DATE_INPUT_RGX))
  ) {
    monthInput = catInput;
    catInput = categoryId;
  } else if (catInput === undefined) {
    catInput = categoryId;
  }

  if (monthInput === undefined) {
    return [catInput, [MIT_CURRENT_MONTH]];
  }
  if (isAverageInput(monthInput)) {
    return [catInput, monthInput];
  }
  if (typeof monthInput === 'number') {
    if (monthInput >= 0) {
      return [catInput, [MIT_SUM, monthInput]];
    }
    return [catInput, [MIT_PAST, monthInput * -1]];
  }

  if (monthInput.match(DATE_INPUT_RGX)) {
    return [catInput, [MIT_DATE, parseISO(monthInput)]];
  }

  throw new Error('Unexpected input');
}

function createGetterFactory(
  currentMonth: MonthData,
  months: MonthData[],
  categoryId: string,
) {
  return (
    selector: (data: DetailedMonthData, catInput: string) => number | undefined,
  ) => (catInput: InputValue, monthInput: InputValue): number => {
    const [cat, monthSelector] = normalizeInputs(
      catInput,
      monthInput,
      categoryId,
    );

    switch (monthSelector[0]) {
      case MIT_DATE: {
        const m = months
          .find(({ date }) => isSameMonth(date, monthSelector[1]))
          ?.get();
        return (m && selector(m, cat)) || 0;
      }
      case MIT_CURRENT_MONTH:
        return selector(currentMonth.get(), cat) || 0;
      case MIT_AVERAGE:
      case MIT_SUM:
      case MIT_PAST: {
        const prevMonths = months.reduce((m, month) => {
          return isBefore(month.date, currentMonth.date) ? m.concat(month) : m;
        }, [] as MonthData[]);

        if (monthSelector[0] === MIT_PAST) {
          const m = prevMonths.reverse()[monthSelector[1] - 1]?.get();
          return (m && selector(m, cat)) || 0;
        }

        let sum = 0;
        let count = 0;
        while (count < monthSelector[1] && prevMonths.length) {
          count += 1;
          const m = prevMonths.pop()?.get();
          sum += (m && selector(m, cat)) || 0;
        }

        if (monthSelector[0] === MIT_AVERAGE) {
          return sum / (count || 1);
        }

        return sum;
      }
    }
  };
}

export type ParseBudgetInputOpts = {
  numberFormatter: NumberFormatter;
  currentMonth: MonthData;
  months: MonthData[];
  categoryId: string;
};
export default function parseBudgetInput(
  inputValue: string,
  {
    numberFormatter: { delimiters, parse: parseNumber },
    currentMonth,
    months,
    categoryId,
  }: ParseBudgetInputOpts,
): number {
  let value = inputValue.replace(/^=([^=])/, '$1');

  if (value.match(new RegExp(`^[0-9${delimiters.join('')} ]+$`))) {
    return parseNumber(value);
  }

  value = value
    .replace(
      new RegExp(`([0-9]+[${delimiters.join('')}][0-9]?)+[0-9]+`, 'g'),
      (v) => String(parseNumber(v)),
    )
    .replace(/~([0-9]+)/g, `['${MIT_AVERAGE}', $1]`);

  const createGetter = createGetterFactory(currentMonth, months, categoryId);
  const parser = new Parser();
  parser.functions.spend = createGetter(
    (data, catInput) => getCatByInput(data, catInput).spend * -1,
  );
  parser.functions.budgeted = createGetter(
    (data, catInput) => getCatByInput(data, catInput).budgeted,
  );
  parser.functions.balance = createGetter(
    (data, catInput) => getCatByInput(data, catInput).balance * -1,
  );
  parser.functions.available = createGetter(
    (data) => data.availableThisMonth.amount,
  ).bind(null, total);
  parser.functions.income = createGetter((data) => data.income.amount).bind(
    null,
    total,
  );
  parser.functions.toBudget = createGetter((data) => data.toBudget).bind(
    null,
    total,
  );
  parser.functions.overspend = createGetter(
    (data) => data.rollover.total * -1,
  ).bind(null, total);
  parser.functions.uncategorized = createGetter(
    (data) => data.uncategorized.amount * -1,
  ).bind(null, total);

  parser.consts.total = total;
  parser.consts.t = total;

  try {
    const evaluated = parser.evaluate(value);

    if (typeof evaluated !== 'number') {
      throw new Error(
        `Input "${inputValue}" unexpectedly evaluated to type ${typeof evaluated}`,
      );
    }

    return evaluated;
  } catch (err) {
    return 0;
  }
}
