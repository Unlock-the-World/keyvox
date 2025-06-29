import React from "react";
import GithubIcon from "../app/icons/github.svg";
import ResetIcon from "../app/icons/reload.svg";
import {Button} from "antd";

interface IErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  info: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<any, IErrorBoundaryState> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Update state with error details
    this.setState({ hasError: true, error, info });
  }

  render() {
    if (this.state.hasError) {
      // Render error message
      return (
        <div className="error">
          <h2>Oops, something went wrong!</h2>
          <pre>
            <code>{this.state.error?.toString()}</code>
            <code>{this.state.info?.componentStack}</code>
          </pre>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <a  className="report">
              <Button
                icon={<GithubIcon />}
              />
            </a>
            <Button
              icon={<ResetIcon />}
              onClick={async () => {

              }}
            />
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
