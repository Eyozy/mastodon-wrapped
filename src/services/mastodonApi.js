/**
 * Mastodon API Service
 * Handles communication with Mastodon instances
 */

const FETCH_TIMEOUT = 15000; // 15 seconds

export const POPULAR_INSTANCES = [
  { name: 'mastodon.social', url: 'https://mastodon.social' },
  { name: 'mastodon.online', url: 'https://mastodon.online' },
  { name: 'mstdn.social', url: 'https://mstdn.social' },
  { name: 'fosstodon.org', url: 'https://fosstodon.org' },
  { name: 'hachyderm.io', url: 'https://hachyderm.io' },
];

/**
 * Fetch with timeout support and external abort signal
 * @param {string} url - URL to fetch
 * @param {Object} options - Fetch options
 * @param {AbortSignal} [externalSignal] - Optional external abort signal for cancellation
 */
async function fetchWithTimeout(url, options = {}, externalSignal) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  // Link external signal to our controller if provided
  const abortHandler = () => controller.abort();
  if (externalSignal) {
    externalSignal.addEventListener('abort', abortHandler);
  }

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    return response;
  } finally {
    clearTimeout(timeout);
    if (externalSignal) {
      externalSignal.removeEventListener('abort', abortHandler);
    }
  }
}

/**
 * Fetch with automatic retry on rate limit and network errors
 * @param {string} url - URL to fetch
 * @param {Object} options - Fetch options
 * @param {number} maxRetries - Maximum number of retry attempts
 */
async function fetchWithRetry(url, options = {}, maxRetries = 3) {
  let lastError;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetchWithTimeout(url, options, options.signal);

      // Handle rate limiting (HTTP 429)
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        let waitTime;

        if (retryAfter) {
          // Use server-provided delay
          waitTime = parseInt(retryAfter) * 1000;
        } else {
          // Exponential backoff: 1s, 2s, 4s
          waitTime = Math.pow(2, attempt) * 1000;
        }

        // If we have retries left, wait and try again
        if (attempt < maxRetries - 1) {
          console.warn(`Rate limited. Waiting ${waitTime}ms before retry ${attempt + 1}/${maxRetries}`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        } else {
          throw new Error('Too many requests. Please wait a moment and try again.');
        }
      }

      // For other errors, don't retry
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('User not found');
        }
        throw new Error(`API Error: ${response.status}`);
      }

      return response;
    } catch (error) {
      lastError = error;

      // Don't retry on abort or user not found
      if (error.name === 'AbortError' || error.message === 'User not found') {
        throw error;
      }

      // If this is the last attempt, throw the error
      if (attempt === maxRetries - 1) {
        throw error;
      }

      // For network errors, wait and retry
      const waitTime = Math.pow(2, attempt) * 1000;
      console.warn(`Network error. Retrying in ${waitTime}ms... (${attempt + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  throw lastError;
}

/**
 * Parse a Mastodon handle into username and instance
 * @param {string} handle - e.g., "user@mastodon.social"
 * @returns {{ username: string, instance: string } | null}
 */
export function parseHandle(handle) {
  const cleanHandle = handle.startsWith('@') ? handle.slice(1) : handle;
  const parts = cleanHandle.split('@');

  if (parts.length === 2 && parts[0] && parts[1]) {
    const instance = parts[1].toLowerCase();

    // Security: Prevent SSRF attacks by validating instance format

    // 1. Reject IP addresses (IPv4)
    if (/^(\d+\.){3}\d+(:\d+)?$/.test(instance)) {
      throw new Error('IP addresses are not allowed as instance');
    }

    // 2. Reject IPv6 addresses
    if (/^\[?[0-9a-f:]+\]?(:\d+)?$/i.test(instance) && instance.includes(':')) {
      throw new Error('IPv6 addresses are not allowed as instance');
    }

    // 3. Reject localhost and private network hosts
    const forbiddenHosts = [
      'localhost', '127.0.0.1', '0.0.0.0', '::1',
      'local', 'localhost.localdomain'
    ];
    if (forbiddenHosts.includes(instance)) {
      throw new Error('Localhost is not allowed as instance');
    }

    // 4. Require public domain format (must contain at least one dot)
    if (!instance.includes('.') || instance.startsWith('.')) {
      throw new Error('Invalid domain format. Instance must be a public domain.');
    }

    // 5. Prevent excessively long domains (DoS protection)
    if (instance.length > 253) {
      throw new Error('Domain name too long');
    }

    // 6. Only allow standard HTTP/HTTPS ports
    if (instance.includes(':')) {
      const [host, port] = instance.split(':');
      const portNum = parseInt(port, 10);
      if (portNum !== 80 && portNum !== 443) {
        throw new Error('Non-standard ports are not allowed');
      }
      // Re-validate host without port
      if (!host.includes('.') || host.length > 253) {
        throw new Error('Invalid domain format');
      }
    }

    // 7. Validate characters (only allow alphanumeric, dots, hyphens)
    const hostWithoutPort = instance.split(':')[0];
    if (!/^[a-z0-9.-]+$/i.test(hostWithoutPort)) {
      throw new Error('Invalid characters in domain name');
    }

    return { username: parts[0], instance };
  }
  return null;
}

/**
 * Look up a user by their account name
 * @param {AbortSignal} [signal] - Optional abort signal for cancellation
 */
export async function lookupAccount(instance, acct, signal) {
  const baseUrl = instance.startsWith('http') ? instance : `https://${instance}`;
  const url = `${baseUrl}/api/v1/accounts/lookup?acct=${encodeURIComponent(acct)}`;

  // Use fetchWithRetry for automatic retry on rate limit
  const response = await fetchWithRetry(url, { signal }, 3);

  return response.json();
}

/**
 * Get an account's statuses (posts)
 * @param {AbortSignal} [options.signal] - Optional abort signal for cancellation
 */
export async function getAccountStatuses(instance, accountId, options = {}) {
  const baseUrl = instance.startsWith('http') ? instance : `https://${instance}`;
  const params = new URLSearchParams({
    limit: options.limit || 40,
    exclude_replies: options.excludeReplies ? 'true' : 'false',
    exclude_reblogs: options.excludeReblogs ? 'true' : 'false',
  });

  if (options.maxId) {
    params.set('max_id', options.maxId);
  }

  const url = `${baseUrl}/api/v1/accounts/${accountId}/statuses?${params}`;

  // Use fetchWithRetry for automatic retry on rate limit
  const response = await fetchWithRetry(url, { signal: options.signal }, 3);

  return response.json();
}

/**
 * Fetch all statuses for a specified calendar year
 * @param {number} year - The year to fetch statuses for
 * @param {AbortSignal} [signal] - Optional abort signal for cancellation
 */
export async function fetchYearStatuses(instance, accountId, onProgress, signal, year) {
  const targetYear = year || new Date().getFullYear();
  // Use LOCAL dates to match user's perceived time
  const startOfYear = new Date(targetYear, 0, 1, 0, 0, 0, 0);
  const endOfYear = new Date(targetYear, 11, 31, 23, 59, 59, 999);

  let allStatuses = [];
  let maxId = null;
  let hasMore = true;
  let fetchCount = 0;
  const maxFetches = 100;

  while (hasMore && fetchCount < maxFetches) {
    // Check if aborted before each request
    if (signal?.aborted) {
      throw new DOMException('Request cancelled', 'AbortError');
    }

    const statuses = await getAccountStatuses(instance, accountId, {
      limit: 40,
      maxId,
      excludeReblogs: false,
      signal,
    });

    if (statuses.length === 0) {
      hasMore = false;
      break;
    }

    const relevantStatuses = [];
    let foundOlderPost = false;
    for (const status of statuses) {
      const statusDate = new Date(status.created_at);
      if (statusDate > endOfYear) {
        continue;
      }
      if (statusDate >= startOfYear) {
        relevantStatuses.push(status);
      } else {
        foundOlderPost = true;
      }
    }

    // Only stop fetching more if we found posts older than startOfYear
    if (foundOlderPost) {
      hasMore = false;
    }

    allStatuses = [...allStatuses, ...relevantStatuses];
    maxId = statuses[statuses.length - 1].id;
    fetchCount++;

    if (onProgress) {
      onProgress(allStatuses.length, fetchCount * 40);
    }

    if (!hasMore) break;

    // Rate limiting delay
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  return allStatuses;
}

/**
 * Main function to get user data for the wrapped experience
 * @param {number} [year] - The year to fetch data for (defaults to smart selection)
 * @param {AbortSignal} [signal] - Optional abort signal for cancellation
 */
export async function getUserData(handle, onProgress, lang = 'en', signal, year) {
  const parsed = parseHandle(handle);

  if (!parsed) {
    const errorMsg = lang === 'zh'
      ? '请输入有效的 Mastodon 账户地址，格式：用户名@实例'
      : 'Please enter a valid Mastodon handle, format: username@instance';
    throw new Error(errorMsg);
  }

  const { username, instance } = parsed;

  const lookupMsg = lang === 'zh' ? '正在查找用户...' : 'Looking up user...';
  if (onProgress) onProgress(lookupMsg);
  const account = await lookupAccount(instance, username, signal);

  const fetchingMsg = lang === 'zh' ? '正在获取嘟文...' : 'Fetching toots...';
  if (onProgress) onProgress(fetchingMsg);
  const statuses = await fetchYearStatuses(instance, account.id, (current) => {
    const progressMsg = lang === 'zh'
      ? `正在获取嘟文... ${current} 条`
      : `Fetching toots... ${current} toots`;
    if (onProgress) {
      onProgress(progressMsg);
      onProgress(current);
    }
  }, signal, year);

  return { account, statuses, instance, year };
}

/**
 * Get the default year to display based on current date
 * If we're in Jan-Feb, default to previous year (more complete data)
 * Otherwise default to current year
 */
export function getDefaultYear() {
  const now = new Date();
  const currentMonth = now.getMonth(); // 0-11, local time
  const currentYear = now.getFullYear();

  // If January (0) or February (1), default to previous year
  if (currentMonth <= 1) {
    return currentYear - 1;
  }
  return currentYear;
}

/**
 * Get available years from user's statuses
 * Returns the years that have posts, sorted descending (most recent first)
 * Also returns the recommended default year based on the data
 */
export async function getAvailableYears(instance, accountId, signal) {
  // Fetch a small batch of recent statuses to determine available years
  const statuses = await getAccountStatuses(instance, accountId, {
    limit: 40,
    signal,
  });

  if (statuses.length === 0) {
    return { years: [new Date().getFullYear()], defaultYear: new Date().getFullYear() };
  }

  // Get unique years from statuses (using local time)
  const years = [...new Set(statuses.map(s => new Date(s.created_at).getFullYear()))];
  years.sort((a, b) => b - a); // Sort descending

  // The default year is the year of the most recent post
  const mostRecentYear = new Date(statuses[0].created_at).getFullYear();

  return { years, defaultYear: mostRecentYear };
}
