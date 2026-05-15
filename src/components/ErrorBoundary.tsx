import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center bg-black text-white min-h-screen flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
            <span className="text-red-500 text-2xl font-bold">!</span>
          </div>
          <h1 className="text-xl font-bold mb-2">Algo deu errado.</h1>
          <p className="text-neutral-500 mb-6 max-w-xs mx-auto">
            Ocorreu um erro inesperado ao carregar esta página.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-yellow-500 text-black px-6 py-2 rounded-full font-bold hover:brightness-110 transition active:scale-95 mb-4"
          >
            Recarregar Página
          </button>
          
          {import.meta.env.DEV && this.state.error && (
            <div className="mt-8 p-4 bg-neutral-900 rounded-lg text-left overflow-auto max-w-full">
              <p className="text-xs font-mono text-red-400 break-all">
                {this.state.error.toString()}
              </p>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
