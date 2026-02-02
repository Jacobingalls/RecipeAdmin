import { Component } from 'react'

/**
 * Error boundary that catches render errors and displays a recovery UI.
 */
export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error }
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo)
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null })
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="container py-4" style={{ maxWidth: 600 }}>
                    <div className="alert alert-danger">
                        <h4 className="alert-heading">Something went wrong</h4>
                        <p className="mb-2">{this.state.error?.message || 'An unexpected error occurred'}</p>
                        <hr />
                        <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={this.handleReset}
                        >
                            Try again
                        </button>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}
