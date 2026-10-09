import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#f6f7f9] flex flex-col items-center justify-center p-4 text-center">
          <div className="bg-white p-6 rounded-2xl shadow-md max-w-md w-full border border-gray-100">
            <span className="text-4xl mb-3 block">🍕</span>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Ops! Ocorreu um imprevisto</h2>
            <p className="text-xs text-gray-600 mb-4">
              Não se preocupe, seus dados estão salvos. Clique abaixo para recarregar o cardápio.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="w-full bg-[#D32F2F] hover:bg-[#B71C1C] text-white py-3 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Recarregar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
