import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Buffer } from 'buffer'
window.Buffer = Buffer
// Provide a minimal process.env shim needed by the buffer polyfill (H-5: scoped to env only)
if (!window.process) {
  window.process = { env: { NODE_ENV: import.meta.env.PROD ? 'production' : 'development' } };
}
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { ShopProvider } from './context/ShopContext.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import './index.css'
import App from './App.jsx'
import { ApolloProvider } from '@apollo/client/react'
import { client, persistCachePromise } from './apollo.js';
import { initPixel } from './utils/pixel.js';

// Initialize Meta Pixel
initPixel();

// Wait for cache to be restored from sessionStorage before mounting the application.
// This prevents initial mount queries from hitting the network if cache is available.
// NOTE: console.* calls are dropped at compile time in production via Vite esbuild config (M-1 fix).
persistCachePromise.then(() => {
  createRoot(document.getElementById('root')).render(

    <StrictMode>
      <ErrorBoundary>
        {/* L-1 fix: BrowserRouter wraps AuthProvider+ShopProvider so useNavigate is available in context if ever needed */}
        <BrowserRouter>
          <ApolloProvider client={client}>
            <AuthProvider>
              <ShopProvider>
                <App />
              </ShopProvider>
            </AuthProvider>
          </ApolloProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </StrictMode>,
  );
});

