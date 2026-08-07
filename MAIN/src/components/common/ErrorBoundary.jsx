import { Component } from 'react'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error) {
    console.error(error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4">
          <div className="max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#16A34A]">Unexpected issue</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">Something went wrong</h2>
            <p className="mt-3 text-sm text-slate-600">Please refresh the page or contact support if this keeps happening.</p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
