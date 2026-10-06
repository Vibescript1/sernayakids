import React from 'react';

/**
 * Global Error Boundary — catches unhandled render errors and displays
 * a branded fallback UI instead of a white screen.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Only log in development
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary] Caught error:', error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FBF9F4',
          fontFamily: "'Outfit', 'Quicksand', sans-serif",
          padding: '2rem',
        }}>
          <div style={{
            textAlign: 'center',
            maxWidth: '480px',
            padding: '3rem 2rem',
            backgroundColor: '#ffffff',
            borderRadius: '1.5rem',
            boxShadow: '0 8px 32px rgba(26, 32, 44, 0.08)',
            border: '1px solid rgba(26, 32, 44, 0.06)',
          }}>
            {/* Icon */}
            <div style={{
              width: '72px',
              height: '72px',
              margin: '0 auto 1.5rem',
              borderRadius: '50%',
              backgroundColor: '#FFF5F5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
            }}>
              😔
            </div>

            <h1 style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              color: '#1A202C',
              marginBottom: '0.75rem',
              letterSpacing: '-0.01em',
            }}>
              Something Went Wrong
            </h1>

            <p style={{
              fontSize: '0.875rem',
              color: '#1A202C99',
              lineHeight: 1.6,
              marginBottom: '2rem',
              fontWeight: 500,
            }}>
              We're sorry for the inconvenience. Please try refreshing the page 
              or click the button below to try again.
            </p>

            {import.meta.env.DEV && this.state.error && (
              <pre style={{
                textAlign: 'left',
                fontSize: '0.7rem',
                color: '#E53E3E',
                backgroundColor: '#FFF5F5',
                padding: '1rem',
                borderRadius: '0.75rem',
                marginBottom: '1.5rem',
                overflow: 'auto',
                maxHeight: '120px',
                border: '1px solid #FED7D7',
              }}>
                {this.state.error.toString()}
              </pre>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={this.handleReset}
                style={{
                  backgroundColor: '#1A202C',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.75rem 2rem',
                  borderRadius: '999px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  letterSpacing: '0.03em',
                  textTransform: 'uppercase',
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#000'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#1A202C'}
              >
                Try Again
              </button>

              <button
                onClick={() => window.location.href = '/'}
                style={{
                  backgroundColor: 'transparent',
                  color: '#1A202C',
                  border: '2px solid #1A202C20',
                  padding: '0.75rem 2rem',
                  borderRadius: '999px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'border-color 0.2s',
                  letterSpacing: '0.03em',
                  textTransform: 'uppercase',
                }}
                onMouseEnter={(e) => e.target.style.borderColor = '#E5634980'}
                onMouseLeave={(e) => e.target.style.borderColor = '#1A202C20'}
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
