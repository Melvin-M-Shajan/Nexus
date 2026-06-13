import { Component } from 'react'
import { AlertTriangle } from 'lucide-react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }
  static getDerivedStateFromError(error) {
    return { error }
  }
  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('NEXUS error boundary:', error, info)
  }
  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8 text-center">
          <AlertTriangle size={40} className="text-[var(--accent-red)]" />
          <h2 className="font-display text-xl font-bold">Something broke in this view</h2>
          <p className="max-w-md text-sm text-[var(--text-secondary)]">{String(this.state.error?.message || this.state.error)}</p>
          <button
            onClick={() => this.setState({ error: null })}
            className="rounded-lg bg-[var(--accent-cyan)] px-4 py-2 text-sm font-bold text-[#02060d]"
          >
            Try again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
