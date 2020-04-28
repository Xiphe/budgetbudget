import React, { ReactNode } from 'react';
import Content from './Content';
import Header, { HeaderSpacer } from './Header';
import LoadingError from './LoadingError';

type ErrorWithRetry = Error & {
  retry?: null | (() => void);
};

export function FullScreenError({ error }: { error: ErrorWithRetry }) {
  return (
    <Content
      background
      padding
      header={
        <Header center>
          <HeaderSpacer />
          Error
          <HeaderSpacer />
        </Header>
      }
    >
      <h3>An Error Ocurred</h3>
      <LoadingError message={error.message} retry={error.retry || undefined} />
    </Content>
  );
}

export default class ErrorBoundary extends React.Component<
  { children: ReactNode; error?: Error },
  { error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch() {
    // You can also log the error to an error reporting service
    // logErrorToMyService(error, errorInfo);
  }

  render() {
    const error = this.state.error || this.props.error;
    if (error) {
      return <FullScreenError error={error} />;
    }

    return this.props.children;
  }
}
