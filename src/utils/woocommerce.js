import axios from 'axios';

// Helper for percent encoding matching RFC 3986
function percentEncode(str) {
  return encodeURIComponent(str)
    .replace(/[!'()*]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase())
    .replace(/%20/g, '+');
}

// Generate a cryptographically-secure 32-character nonce using Web Crypto API (M-3 fix)
function generateNonce() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const array = new Uint8Array(32);
  window.crypto.getRandomValues(array);
  return Array.from(array, byte => chars[byte % chars.length]).join('');
}

// Native browser-safe HMAC-SHA256 signer using Web Crypto API
async function generateSignature(method, url, params, consumerSecret) {
  // 1. Sort parameters alphabetically by key
  const sortedKeys = Object.keys(params).sort();
  const paramPairs = sortedKeys.map(
    key => `${percentEncode(key)}=${percentEncode(String(params[key]))}`
  );
  const paramString = paramPairs.join('&');

  // 2. Base String: UPPERCASE_METHOD & encoded_url & encoded_params
  const baseString = [
    method.toUpperCase(),
    percentEncode(url),
    percentEncode(paramString)
  ].join('&');

  // 3. Signing Key: secret & (with trailing ampersand)
  const signingKey = `${percentEncode(consumerSecret)}&`;

  // 4. SubtleCrypto signing
  const encoder = new TextEncoder();
  const keyData = encoder.encode(signingKey);
  const messageData = encoder.encode(baseString);

  const cryptoKey = await window.crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBuffer = await window.crypto.subtle.sign(
    'HMAC',
    cryptoKey,
    messageData
  );

  // Convert buffer to Base64
  const hashArray = Array.from(new Uint8Array(signatureBuffer));
  const hashString = hashArray.map(b => String.fromCharCode(b)).join('');
  return btoa(hashString);
}

class WooCommerceRestApi {
  constructor(config) {
    this.url = config.url.replace(/\/$/, ''); // Remove trailing slash
    this.consumerKey = config.consumerKey;
    this.consumerSecret = config.consumerSecret;
  }

  async #getOAuthParams(method, endpoint, customParams = {}) {
    const requestUrl = `${this.url}/wp-json/wc/v3/${endpoint}`;
    
    // Use Basic Auth for HTTPS and local dev (secure). Fall through to OAuth 1.0a for plain HTTP. (C-3 fix: removed dead || true)
    if (this.url.startsWith('https') || this.url.includes('localhost') || this.url.includes('127.0.0.1')) {
      return {
        auth: {
          username: this.consumerKey,
          password: this.consumerSecret
        },
        params: customParams
      };
    }

    // HTTP plain connection: Generate OAuth 1.0a parameters
    const oauthParams = {
      oauth_consumer_key: this.consumerKey,
      oauth_nonce: generateNonce(),
      oauth_signature_method: 'HMAC-SHA256',
      oauth_timestamp: Math.floor(Date.now() / 1000),
      ...customParams
    };

    // Generate signature
    const signature = await generateSignature(method, requestUrl, oauthParams, this.consumerSecret);
    
    return {
      params: {
        ...oauthParams,
        oauth_signature: signature
      }
    };
  }

  // GET Requests
  async get(endpoint, params = {}) {
    const url = `${this.url}/wp-json/wc/v3/${endpoint}`;
    const authConfig = await this.#getOAuthParams('GET', endpoint, params);
    
    const response = await axios.get(url, authConfig);
    return response;
  }

  // POST Requests
  async post(endpoint, data = {}, params = {}) {
    const url = `${this.url}/wp-json/wc/v3/${endpoint}`;
    const authConfig = await this.#getOAuthParams('POST', endpoint, params);
    
    const response = await axios.post(url, data, authConfig);
    return response;
  }
}

export default WooCommerceRestApi;