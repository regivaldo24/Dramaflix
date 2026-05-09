import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-4 text-center">
          <h1 className="text-2xl font-bold mb-4 text-[#ff2e55]">Ups! Ocorreu um erro inesperado.</h1>
          <p className="text-neutral-500 mb-8 max-w-md">
            Lamentamos o inconveniente. Tente recarregar a página ou voltar mais tarde.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-[#ff2e55] text-white px-6 py-2 rounded-full font-bold hover:brightness-110 transition"
          >
            Recarregar página
          </button>
          {import.meta.env.DEV && (
            <pre className="mt-8 p-4 bg-neutral-900 rounded text-left overflow-auto max-w-full text-xs text-red-400">
              {this.state.error?.toString()}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
