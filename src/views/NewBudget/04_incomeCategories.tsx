import React, { useState } from 'react';
import cx from 'classnames';

import SingleBudget, { onlyIncome } from './components/SingleBudget';
import { Step } from './Types';
import styles from './NewBudget.module.scss';
import { Button, Row, Select, Table } from '../../components';
import { CategorySpacer, SingleCategory } from '../CategorySidebar';
import {
  ACTION_SETTINGS_ADD_INCOME_CATEGORY,
  ACTION_SETTINGS_REMOVE_INCOME_CATEGORY,
  ACTION_SETTINGS_SET_INCOME_AVAILABLE_IN,
  useBudgetData,
} from '../../budget';
import { mapCategories } from '../../lib';
import Input from '../Settings/Input';

const AvailableFunds: Step = {
  title: 'Fill Categories',
  initialOk() {
    return true;
  },
  Comp(props) {
    const { months } = useBudgetData(props.state, props.moneyMoney);
    const [search, setSearch] = useState('');
    const [categories] = props.moneyMoney.categories.read();
    const incomeCategoryIds = props.state.settings.incomeCategories.map(
      ({ id }) => id,
    );
    const nonIncomeCategories = categories.filter(
      ({ uuid }) => !incomeCategoryIds.includes(uuid),
    );

    return (
      <>
        <SingleBudget {...props} small fullHeight mapMonthData={onlyIncome} />
        <div
          className={cx(
            styles.explainWrap,
            styles.explainBody,
            styles.explainSpaceS,
          )}
        >
          <h1 className={styles.center}>Setup Income</h1>
          <p>
            To have money available "to Budget" BudgetBudget needs to know which
            Categories you are using for your income
          </p>
          <p>
            Budgeting works best if you use explicit categories you use
            exclusively for your income.
          </p>

          <h3>Income Categories</h3>
          <div>
            {props.state.settings.incomeCategories.map(
              ({ id, availableIn }, i) => {
                const cat = categories.find(({ uuid }) => uuid === id);

                if (!cat) {
                  return null;
                }

                return (
                  <Row key={id} leaf={true} odd={!(i % 2)} noPadding>
                    <Button
                      onClick={() =>
                        props.dispatch({
                          type: ACTION_SETTINGS_REMOVE_INCOME_CATEGORY,
                          payload: id,
                        })
                      }
                    >
                      -
                    </Button>
                    <SingleCategory {...cat} />
                    <CategorySpacer />
                    available &nbsp;{' '}
                    <Select
                      margin={false}
                      value={availableIn}
                      onChange={(ev) =>
                        props.dispatch({
                          type: ACTION_SETTINGS_SET_INCOME_AVAILABLE_IN,
                          payload: {
                            categoryId: id,
                            availableIn: parseInt(ev.target.value, 10),
                          },
                        })
                      }
                    >
                      <option value={0}>this month</option>
                      <option value={1}>next month</option>
                    </Select>
                  </Row>
                );
              },
            )}
          </div>
          <p>
            With the current settings this is your income in the past months
          </p>

          <Table className={styles.table}>
            <thead>
              <tr>
                <td></td>
                {Array(2)
                  .fill('')
                  .map((_, i) => (
                    <td key={months[i + 1].name}>{months[i + 1].name}</td>
                  ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className={styles.tableTitle}>Income</td>
                {Array(2)
                  .fill('')
                  .map((_, i) => (
                    <td key={months[i + 1].name}>
                      {props.numberFormatter.format(
                        months[i + 1].get().income.amount,
                      )}
                    </td>
                  ))}
              </tr>
            </tbody>
          </Table>
          <br />
          <hr />
          <div className={styles.expanseHeadline}>
            <h3>Expense Categories</h3>
            <span className={styles.expanseHeadlineSpacer} />
            <Input
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {mapCategories(
            nonIncomeCategories,
            [],
            ({ uuid, name, group, indentation, icon }, i, groupClosed) => {
              if (!name.toLowerCase().includes(search.toLowerCase())) {
                return null;
              }

              return (
                <Row
                  noPadding
                  key={uuid}
                  indent={indentation}
                  leaf={!group}
                  odd={!(i % 2)}
                  groupClosed={groupClosed}
                >
                  <SingleCategory
                    name={name}
                    icon={!group ? icon : undefined}
                  />
                  {!group && (
                    <>
                      <CategorySpacer />
                      <Button
                        noMargin
                        onClick={() =>
                          props.dispatch({
                            type: ACTION_SETTINGS_ADD_INCOME_CATEGORY,
                            payload: { categoryId: uuid },
                          })
                        }
                      >
                        +
                      </Button>
                    </>
                  )}
                </Row>
              );
            },
          )}
        </div>
      </>
    );
  },
};

export default AvailableFunds;
