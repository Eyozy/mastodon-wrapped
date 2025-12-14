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
 * Fetch with timeout support
 */
async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    return response;
  } finally {
    clearTimeout(timeout);
  }
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
    return { username: parts[0], instance: parts[1] };
  }
  return null;
}

/**
 * Look up a user by their account name
 */
export async function lookupAccount(instance, acct) {
  const baseUrl = instance.startsWith('http') ? instance : `https://${instance}`;
  const url = `${baseUrl}/api/v1/accounts/lookup?acct=${encodeURIComponent(acct)}`;

  const response = await fetchWithTimeout(url);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('User not found');
    }
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}

/**
 * Get an account's statuses (posts)
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
  const response = await fetchWithTimeout(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch toots: ${response.status}`);
  }

  return response.json();
}

/**
 * Fetch all statuses for the current calendar year
 */
export async function fetchYearStatuses(instance, accountId, onProgress) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const startOfYear = new Date(currentYear, 0, 1);
  const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);

  let allStatuses = [];
  let maxId = null;
  let hasMore = true;
  let fetchCount = 0;
  const maxFetches = 100;

  while (hasMore && fetchCount < maxFetches) {
    const statuses = await getAccountStatuses(instance, accountId, {
      limit: 40,
      maxId,
      excludeReblogs: false,
    });

    if (statuses.length === 0) {
      hasMore = false;
      break;
    }

    const relevantStatuses = [];
    for (const status of statuses) {
      const statusDate = new Date(status.created_at);
      if (statusDate > endOfYear) continue;
      if (statusDate >= startOfYear) {
        relevantStatuses.push(status);
      } else {
        hasMore = false;
      }
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
 */
export async function getUserData(handle, onProgress, lang = 'en') {
  const parsed = parseHandle(handle);

  if (!parsed) {
    const errorMsg = lang === 'zh'
      ? '请输入有效的 Mastodon 账户地址，格式: 用户名@实例'
      : 'Please enter a valid Mastodon handle, format: username@instance';
    throw new Error(errorMsg);
  }

  const { username, instance } = parsed;

  const lookupMsg = lang === 'zh' ? '正在查找用户...' : 'Looking up user...';
  if (onProgress) onProgress(lookupMsg);
  const account = await lookupAccount(instance, username);

  const fetchingMsg = lang === 'zh' ? '正在获取嘟文...' : 'Fetching toots...';
  if (onProgress) onProgress(fetchingMsg);
  const statuses = await fetchYearStatuses(instance, account.id, (current, total) => {
    const progressMsg = lang === 'zh'
      ? `正在获取嘟文... ${current} 条`
      : `Fetching toots... ${current} toots`;
    if (onProgress) {
      onProgress(progressMsg);
      onProgress(current);
    }
  });

  return { account, statuses, instance };
}
