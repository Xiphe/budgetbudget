import React, {
  createContext,
  useState,
  ReactNode,
  useMemo,
  ComponentType,
  useContext,
} from 'react';

type SettingsContextType = [boolean, (showSettings: boolean) => void];
const ShowSettingsContext = createContext<SettingsContextType | null>(null);

function ShowSettingsProvider({ children }: { children: ReactNode }) {
  const [showSettings, setShowSettings] = useState<boolean>(false);

  return (
    <ShowSettingsContext.Provider
      value={useMemo(() => [showSettings, setShowSettings], [
        showSettings,
        setShowSettings,
      ])}
    >
      {children}
    </ShowSettingsContext.Provider>
  );
}

export function withShowSettingsProvider<P extends object>(
  WrappedComponent: ComponentType<P>,
) {
  return (props: P) => (
    <ShowSettingsProvider>
      <WrappedComponent {...props} />
    </ShowSettingsProvider>
  );
}

export function useSetShowSettings() {
  const showSettings = useContext(ShowSettingsContext);
  return showSettings ? showSettings[1] : undefined;
}

export function useShowSettings() {
  const value = useContext(ShowSettingsContext);
  if (!value) {
    throw new Error('Can not useShowSettings outside of ShowSettingsProvider');
  }
  return value[0];
}
