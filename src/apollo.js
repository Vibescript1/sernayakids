import { ApolloClient, InMemoryCache, ApolloLink, Observable } from '@apollo/client';
import { BatchHttpLink } from "@apollo/client/link/batch-http";
import { RetryLink } from '@apollo/client/link/retry';
import { persistCache } from 'apollo3-cache-persist';

// ─── In-Memory Token Store ────────────────────────────────────────────────────
let _jwtToken = null;

export const setAuthToken  = (token) => { _jwtToken = token || null; };
export const getAuthToken  = ()      => _jwtToken;
export const clearAuthToken = ()     => { _jwtToken = null; };

// ─── Link 1: Auth + Session ───────────────────────────────────────────────────
const sessionLink = new ApolloLink((operation, forward) => {
  const jwtToken     = getAuthToken();
  const sessionToken = sessionStorage.getItem('woocommerce-session');

  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      ...(jwtToken     ? { 'Authorization':      `Bearer ${jwtToken}`   } : {}),
      ...(sessionToken ? { 'woocommerce-session': `Session ${sessionToken}` } : {}),
    },
  }));

  return new Observable((observer) => {
    let sub;
    try {
      sub = forward(operation).subscribe({
        next: (response) => {
          const newSession = response.extensions?.woocommerceSession;
          if (newSession) sessionStorage.setItem('woocommerce-session', newSession);
          observer.next(response);
        },
        error:    (err) => observer.error(err),
        complete: ()    => observer.complete(),
      });
    } catch (err) {
      observer.error(err);
    }
    return () => { if (sub) sub.unsubscribe(); };
  });
});

// ─── Link 2: Retry ───────────────────────────────────────────────────────────
const retryLink = new RetryLink({
  delay: { initial: 1500, max: 10000, jitter: true },
  attempts: {
    max: 2,   
    retryIf: (error) => {
      if (!error) return false;
      if (error.statusCode === 429 || error.response?.status === 429) return false; // Hard fail on 429
      if (error.statusCode === 503 || error.response?.status === 503) return true;
      if (error.message?.includes('Failed to fetch')) return true;
      if (error.message?.includes('NetworkError'))    return true;
      return false;
    },
  },
});

// ─── Link 3: Throttle ────────────────────────────────────────────────────────
const MIN_REQUEST_GAP_MS = 400;
let lastRequestTime = 0;

const throttleLink = new ApolloLink((operation, forward) => {
  return new Observable((observer) => {
    const { priority } = operation.getContext();
    if (priority) {
      const sub = forward(operation).subscribe({
        next:     (result) => observer.next(result),
        error:    (err)    => observer.error(err),
        complete: ()       => observer.complete(),
      });
      return () => sub.unsubscribe();
    }

    const now  = Date.now();
    const wait = Math.max(0, lastRequestTime + MIN_REQUEST_GAP_MS - now);
    lastRequestTime = now + wait;

    const timer = setTimeout(() => {
      const sub = forward(operation).subscribe({
        next:     (result) => observer.next(result),
        error:    (err)    => observer.error(err),
        complete: ()       => observer.complete(),
      });
      return () => sub.unsubscribe();
    }, wait);

    return () => clearTimeout(timer);
  });
});

// ─── Link 4: HTTP (Batching Configuration Upgrade) ───────────────────────────
const batchHttpLink = new BatchHttpLink({
  uri: '/graphql',
  credentials: 'include',
  batchInterval: 10,
  batchMax: 5,
});

// ─── Cache & Persistence Setup ───────────────────────────────────────────────
const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        customer: {
          merge(existing, incoming, { mergeObjects }) {
            return mergeObjects(existing, incoming);
          }
        }
      }
    }
  }
});

// Persist the cache in sessionStorage. This keeps cached data valid across page
// refreshes inside the same tab, but automatically clears it when the tab is closed.
export const persistCachePromise = persistCache({
  cache,
  storage: window.sessionStorage,
});

// ─── Client ───────────────────────────────────────────────────────────────────
export const client = new ApolloClient({
  link: ApolloLink.from([sessionLink, retryLink, throttleLink, batchHttpLink]),
  cache,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network', // Return cached data immediately, then fetch updates
      nextFetchPolicy: 'cache-first',
    },
    query: {
      fetchPolicy: 'cache-first', // Use cache first if available
    },
  },
});