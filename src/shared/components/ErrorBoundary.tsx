import React from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

interface Props {
  children?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Unhandled error caught by ErrorBoundary:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-6 text-center select-none font-sans">
          <div className="bg-white border border-[#E5E0D8] rounded-3xl p-8 max-w-md w-full shadow-lg space-y-6">
            <div className="mx-auto bg-rose-50 border border-rose-100 p-3 rounded-full text-rose-600 w-fit">
              <AlertCircle className="h-8 w-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold font-display text-[#1C1008]">Something went wrong</h3>
              <p className="text-xs text-[#4E453F] leading-relaxed">
                An unexpected error occurred. The application sandbox caught a rendering exception. You can refresh the view to restore stability.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-stone-50 border border-stone-100 rounded-xl p-3 text-left">
                <span className="text-[9px] font-mono text-stone-400 block uppercase tracking-wider font-bold">Error logs</span>
                <code className="text-[10px] font-mono text-rose-700 break-words font-semibold leading-normal">
                  {this.state.error.message || String(this.state.error)}
                </code>
              </div>
            )}

            <button
              onClick={this.handleReset}
              className="w-full py-3 bg-[#1C1008] text-white hover:bg-stone-900 transition-colors rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Reload Application</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
export default ErrorBoundary;
