import React, { useEffect } from 'react';
import { ipcRenderer } from 'electron';
import { useMenu, useRecentFiles } from '../../lib';
import { Content, Button, Header } from '../../components';
import styles from './Welcome.module.scss';
import logo from '../../img/logo.png';

type Props = {
  onCreate: () => void;
};
export default function Welcome({ onCreate }: Props) {
  const [
    transitioning,
    startTransition,
  ] = (React as any).unstable_useTransition({
    timeoutMs: 3000,
  });
  useMenu();
  useEffect(() => {
    const handler = () => {
      ipcRenderer.send('QUIT');
    };
    ipcRenderer.on('WINDOW_CREATED', handler);
    return () => {
      ipcRenderer.off('WINDOW_CREATED', handler);
    };
  }, []);
  const recentFiles = useRecentFiles();

  return (
    <Content
      padding
      header={<Header>Welcome</Header>}
      className={styles.wrapper}
    >
      <div>
        <img
          className={styles.logo}
          src={logo}
          alt="BudgetBudget Logo - treasure chest"
        />
        <h1 className={styles.title}>Welcome to BudgetBudget (Beta)</h1>
        <h3 className={styles.subtitle}>
          envelope-style budgeting for your MoneyMoney transactions
        </h3>
      </div>

      <div className={styles.actionContainer}>
        {recentFiles.length ? (
          <div className={styles.recentContainer}>
            <h3>Open recently used budget:</h3>
            {recentFiles.slice(0, 5).map(({ file, name }) => (
              <button
                className={styles.recentButton}
                key={file}
                onClick={() =>
                  ipcRenderer.invoke('MENU_FILE_OPEN_EXISTING', file)
                }
              >
                <span className={styles.recentTitle}>{name}</span>
                <span className={styles.recentFile}>{file}</span>
              </button>
            ))}
          </div>
        ) : null}
        <div>
          <h3>Already created a Budget in the past?</h3>
          <Button onClick={() => ipcRenderer.invoke('MENU_FILE_OPEN')}>
            Open existing .budget File
          </Button>
          <br />
          <br />

          <h3>New to this?</h3>
          <Button
            primary
            disabled={transitioning}
            onClick={() => startTransition(() => onCreate())}
          >
            Create a new Budget
          </Button>
        </div>
      </div>
    </Content>
  );
}
