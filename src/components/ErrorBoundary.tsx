import React, { ErrorInfo, ReactNode } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
  // Explicitly annotate props and state to satisfy any strict TypeScript compiler issues
  props: Props;
  state: State;

  constructor(props: Props) {
    super(props);
    this.props = props;
    this.state = {
      hasError: false
    };
  }

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an unhandled error:", error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-[400px] w-full p-6">
          <div className="w-full max-w-md rounded-[24px] bg-gradient-to-b from-[#14101e]/85 to-[#07050d]/98 border border-red-500/20 p-8 shadow-[0_20px_50px_rgba(239,68,68,0.05)] text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-red-500/20 via-red-500 to-red-500/20" />
            
            <div className="mx-auto w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-5">
              <AlertCircle size={22} />
            </div>

            <h3 className="text-sm font-mono font-bold text-white tracking-wider uppercase mb-3">
              SYSTEM DISRUPTION
            </h3>
            
            <p className="text-xs text-slate-300 leading-relaxed font-sans mb-6">
              Terjadi gangguan pada tampilan halaman. Silakan muat ulang halaman atau coba kembali.
            </p>

            <button
              onClick={this.handleReload}
              className="w-full py-3 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 hover:border-red-500/50 text-red-200 hover:text-white transition-all text-xs font-mono font-bold uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw size={14} />
              MUAT ULANG HALAMAN
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
