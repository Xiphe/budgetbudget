import React, { ComponentType, ReactNode } from 'react';
import Content from './Content';
import Header, { HeaderSpacer } from './Header';
import LoadingError from './LoadingError';

type ErrorWithRetry = Error & {
  retry?: () => void;
};

export type ErrorProps = {
  error: ErrorWithRetry;
  retry?: () => void;
};

export function RenderError({ error, retry }: ErrorProps) {
  return (
    <>
      <h3>An Error Ocurred</h3>
      <LoadingError message={error.message} retry={retry} />
    </>
  );
}

export function FullScreenError(props: ErrorProps) {
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
      <RenderError {...props} />
    </Content>
  );
}

export default class ErrorBoundary extends React.Component<
  { children: ReactNode; fallback?: ComponentType<ErrorProps> },
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
    const Comp = this.props.fallback || FullScreenError;
    if (error) {
      return <Comp error={error} retry={retry && this.resetError} />;
    }

    return this.props.children;
  }
}
