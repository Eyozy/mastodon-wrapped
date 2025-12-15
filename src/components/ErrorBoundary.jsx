import React from "react";

/**
 * Error Boundary component to catch and handle React component errors
 * Prevents entire app from crashing when a component throws an error
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const { lang = "en" } = this.props;

      return (
        <div className="error-boundary">
          <div className="error-content">
            <div className="error-icon">⚠️</div>
            <h2 className="error-title">
              {lang === "zh" ? "出错了" : "Something went wrong"}
            </h2>
            <p className="error-message">
              {lang === "zh"
                ? "应用遇到了意外错误，请刷新页面重试。"
                : "The application encountered an unexpected error. Please refresh and try again."}
            </p>
            <button className="error-button" onClick={this.handleReset}>
              {lang === "zh" ? "刷新页面" : "Refresh Page"}
            </button>
          </div>
          <style>{`
            .error-boundary {
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              padding: 20px;
            }
            .error-content {
              background: white;
              padding: 40px;
              border-radius: 16px;
              text-align: center;
              max-width: 400px;
              box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            }
            .error-icon {
              font-size: 48px;
              margin-bottom: 16px;
            }
            .error-title {
              font-size: 24px;
              font-weight: 700;
              color: #1e293b;
              margin: 0 0 12px 0;
            }
            .error-message {
              font-size: 14px;
              color: #64748b;
              margin: 0 0 24px 0;
              line-height: 1.5;
            }
            .error-button {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              border: none;
              padding: 12px 32px;
              border-radius: 8px;
              font-size: 14px;
              font-weight: 600;
              cursor: pointer;
              transition: transform 0.2s, box-shadow 0.2s;
            }
            .error-button:hover {
              transform: translateY(-2px);
              box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
            }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
