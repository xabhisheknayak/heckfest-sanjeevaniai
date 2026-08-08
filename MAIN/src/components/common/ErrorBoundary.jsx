import { Component } from 'react'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('SanjivniAI ErrorBoundary caught an unhandled error:', error, errorInfo)
  }

  handleResetSession = () => {
    try {
      localStorage.removeItem('sanjivni-demo-auth')
      localStorage.removeItem('sanjivni-emergency-contacts')
    } catch (e) {
      console.warn('Failed to clear storage:', e)
    }
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4 py-12 dark:bg-slate-950 dark:text-slate-100">
          <div className="max-w-md w-full rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
              ⚠️
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#16A34A]">App Recovery Mode</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">Something went wrong</h2>
            <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              An unexpected issue occurred while rendering this page. You can refresh or reset your local session data to recover.
            </p>

            {this.state.error && (
              <div className="mt-4 rounded-xl bg-slate-100 p-3 text-left font-mono text-[11px] text-red-600 dark:bg-slate-950 dark:text-red-400 overflow-x-auto max-h-32 border border-slate-200 dark:border-slate-800">
                {this.state.error.toString()}
              </div>
            )}

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 rounded-xl bg-[#16A34A] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#15803D] transition cursor-pointer"
              >
                🔄 Refresh Page
              </button>
              <button
                onClick={this.handleResetSession}
                className="flex-1 rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
              >
                🧹 Reset Session & Home
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

