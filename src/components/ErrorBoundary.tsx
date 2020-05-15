import React, { ReactNode } from 'react';
import Content from './Content';
import Header, { HeaderSpacer } from './Header';
import LoadingError from './LoadingError';

type ErrorWithRetry = Error & {
  retry?: () => void;
};

export function FullScreenError({
  error,
  retry,
}: {
  error: ErrorWithRetry;
  retry?: () => void;
}) {
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
      <LoadingError message={error.message} retry={retry} />
    </Content>
  );
}

export default class ErrorBoundary extends React.Component<
  { children: ReactNode },
  { error: ErrorWithRetry | undefined }
> {
  constructor(props: any) {
    super(props);
    this.state = { error: undefined };
    this.resetError = this.resetError.bind(this);
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  resetError() {
    if (this.state.error && this.state.error.retry) {
      this.state.error.retry();
    }
    this.setState({ error: undefined });
  }

  render() {
    const error = this.state.error;
    const retry = error && error.retry;
    if (error) {
      return <FullScreenError error={error} retry={retry && this.resetError} />;
    }

    return this.props.children;
  }
}
