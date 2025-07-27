'use client'

import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('3D Animation Error:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center mx-auto">
              <span className="text-2xl">🔧</span>
            </div>
            <p className="text-gray-400 text-sm">3D model unavailable</p>
            <button 
              onClick={() => this.setState({ hasError: false })}
              className="px-4 py-2 text-xs bg-brandInk hover:bg-ink80 text-white rounded transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
} 