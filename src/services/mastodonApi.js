/**
 * Mastodon API Service
 * Handles communication with Mastodon instances
 */

// Common Mastodon instances for quick selection
export const POPULAR_INSTANCES = [
  { name: 'mastodon.social', url: 'https://mastodon.social' },
  { name: 'mastodon.online', url: 'https://mastodon.online' },
  { name: 'mstdn.social', url: 'https://mstdn.social' },
  { name: 'fosstodon.org', url: 'https://fosstodon.org' },
  { name: 'hachyderm.io', url: 'https://hachyderm.io' },
];

/**
 * Parse a Mastodon handle into username and instance
 * @param {string} handle - e.g., "user@mastodon.social" or "@user@mastodon.social"
 * @returns {{ username: string, instance: string } | null}
 */
export function parseHandle(handle) {
  // Remove leading @ if present
  const cleanHandle = handle.startsWith('@') ? handle.slice(1) : handle;

  // Check if it contains an @ for instance
  const parts = cleanHandle.split('@');

  if (parts.length === 2 && parts[0] && parts[1]) {
    return {
      username: parts[0],
      instance: parts[1],
    };
  }

  return null;
}

/**
 * Look up a user by their account name
 * @param {string} instance - The Mastodon instance URL
 * @param {string} acct - The account name (username@instance or just username for local)
 * @returns {Promise<object>} - The account object
 */
export async function lookupAccount(instance, acct) {
  const baseUrl = instance.startsWith('http') ? instance : `https://${instance}`;
  const url = `${baseUrl}/api/v1/accounts/lookup?acct=${encodeURIComponent(acct)}`;

  const response = await fetch(url);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('用户未找到');
    }
    throw new Error(`API 错误: ${response.status}`);
  }

  return response.json();
}

/**
 * Get an account's statuses (posts)
 * @param {string} instance - The Mastodon instance URL
 * @param {string} accountId - The account ID
 * @param {object} options - Query options
 * @returns {Promise<object[]>} - Array of status objects
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
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`无法获取嘟文: ${response.status}`);
  }

  return response.json();
}

/**
 * Fetch all statuses for the current calendar year
 * @param {string} instance - The Mastodon instance
 * @param {string} accountId - The account ID
 * @param {function} onProgress - Progress callback (current, total estimate)
 * @returns {Promise<object[]>} - All statuses from the current year
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
  const maxFetches = 100; // Increased limit to ensure we cover the full year if active

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

    // Filter statuses for the current year
    // Note: APIs return newest first
    const relevantStatuses = [];

    for (const status of statuses) {
      const statusDate = new Date(status.created_at);

      // If status is from next year (future?), skip it (unlikely but safe)
      if (statusDate > endOfYear) continue;

      // If status is from current year, keep it
      if (statusDate >= startOfYear) {
        relevantStatuses.push(status);
      } else {
        // If we hit a status from previous year, we are done
        hasMore = false;
      }
    }

    allStatuses = [...allStatuses, ...relevantStatuses];

    const oldestStatus = statuses[statuses.length - 1];
    maxId = oldestStatus.id;

    fetchCount++;

    if (onProgress) {
      onProgress(allStatuses.length, fetchCount * 40);
    }

    // Optimization: If we found older posts in this batch, stop fetching
    if (!hasMore) break;

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  return allStatuses;
}

/**
 * Main function to get user data for the wrapped experience
 * @param {string} handle - User handle like "user@mastodon.social"
 * @param {function} onProgress - Progress callback
 * @returns {Promise<object>} - User data with account and statuses
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

  // Look up the account
  const lookupMsg = lang === 'zh' ? '正在查找用户...' : 'Looking up user...';
  if (onProgress) onProgress(lookupMsg);
  const account = await lookupAccount(instance, username);

  // Fetch all statuses from the past year
  const fetchingMsg = lang === 'zh' ? '正在获取嘟文...' : 'Fetching toots...';
  if (onProgress) onProgress(fetchingMsg);
  const statuses = await fetchYearStatuses(instance, account.id, (current, total) => {
    const progressMsg = lang === 'zh'
      ? `正在获取嘟文... ${current} 条`
      : `Fetching toots... ${current} toots`;
    if (onProgress) onProgress(progressMsg);
  });

  return {
    account,
    statuses,
    instance,
  };
}
