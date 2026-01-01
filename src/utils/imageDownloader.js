// Dynamic import: only load snapdom when user clicks download (~91KB saved from initial bundle)
const getSnapdom = () => import('@zumer/snapdom').then(m => m.snapdom);

// CORS proxy list with fallback
const CORS_PROXIES = [
  'https://corsproxy.io/?',
  'https://api.allorigins.win/raw?url='
];

/**
 * Download the report as an image using snapdom
 * Uses multiple CORS proxies with fallback
 * Uses snapdom's exclude option to hide elements in the snapshot without affecting the visible UI
 */
export async function downloadReportAsImage(elementId, filename, onProgress) {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Report element not found');
  }

  // Load snapdom dynamically
  const snapdom = await getSnapdom();

  onProgress?.('Preparing capture...');

  // Store original styles for restoration
  const originalStyles = {
    weekdayLabels: [],
    monthLabels: [],
    yearSelector: null,
    statsTitle: null
  };

  // Hide year selector and adjust title gap before capture
  const yearSelector = element.querySelector('.year-selector');
  if (yearSelector) {
    originalStyles.yearSelector = yearSelector.style.display;
    yearSelector.style.display = 'none';
  }

  // Remove gap from stats-title when year-selector is hidden
  const statsTitle = element.querySelector('.stats-title');
  if (statsTitle) {
    originalStyles.statsTitle = statsTitle.style.gap;
    statsTitle.style.gap = '0';
  }

  // Adjust heatmap labels for better spacing (these modifications are necessary for correct rendering)
  const weekdayTexts = element.querySelectorAll('.react-calendar-heatmap-weekday-labels text');
  weekdayTexts.forEach((text) => {
    const originalX = text.getAttribute('x');
    originalStyles.weekdayLabels.push({ text, x: originalX });
    text.setAttribute('x', (parseFloat(originalX) || 0) - 12);
  });

  const monthTexts = element.querySelectorAll('.react-calendar-heatmap-month-labels text');
  monthTexts.forEach((text) => {
    const originalY = text.getAttribute('y');
    originalStyles.monthLabels.push({ text, y: originalY });
    text.setAttribute('y', (parseFloat(originalY) || 0) - 12);
  });

  await new Promise(resolve => setTimeout(resolve, 50));
  onProgress?.('Rendering image...');

  try {
    // Try each proxy until one works
    let lastError = null;
    let errorCount = 0;

    for (const proxy of CORS_PROXIES) {
      try {
        // Use snapdom's exclude option to hide buttons in the snapshot
        // This doesn't affect the original DOM, so no flickering occurs
        const result = await snapdom(element, {
          scale: 2,
          useProxy: proxy,
          exclude: ['.heatmap-hover-text', '.back-button', '.download-button'],
          excludeMode: 'remove'  // Removes elements completely to avoid empty space
        });
        onProgress?.('Downloading...');
        await result.download({ format: 'png', filename: filename.replace('.png', '') });
        onProgress?.('Complete');
        return;
      } catch (error) {
        lastError = error;
        errorCount++;

        // Categorize error for better user feedback
        const isCORSError = error.message?.includes('CORS') ||
                           error.message?.includes('cross-origin') ||
                           error.message?.includes('blocked');

        const isNetworkError = error.message?.includes('network') ||
                              error.message?.includes('fetch') ||
                              error.message?.includes('timeout');

        if (isCORSError || isNetworkError) {
          console.warn(`Proxy ${errorCount} failed (${isCORSError ? 'CORS' : 'network'} error), trying next...`);
        }
      }
    }

    // All proxies failed - provide helpful error message
    if (lastError) {
      const isCORSError = lastError.message?.includes('CORS') ||
                         lastError.message?.includes('cross-origin');

      const isNetworkError = lastError.message?.includes('network') ||
                            lastError.message?.includes('fetch');

      if (isCORSError) {
        throw new Error('Download failed due to network firewall or CORS restrictions. This can happen in corporate networks or certain regions. Please try again later or use a different network.');
      } else if (isNetworkError) {
        throw new Error('Download failed due to network issues. Please check your internet connection and try again.');
      } else {
        throw new Error(`Download failed: ${lastError.message || 'Unknown error'}. Please try again.`);
      }
    }

    throw new Error('Download failed: All image download proxies are unavailable. Please try again later.');
  } finally {
    // Restore year selector
    if (yearSelector && originalStyles.yearSelector !== null) {
      yearSelector.style.display = originalStyles.yearSelector;
    } else if (yearSelector) {
      yearSelector.style.removeProperty('display');
    }

    // Restore stats-title gap
    if (statsTitle && originalStyles.statsTitle !== null) {
      statsTitle.style.gap = originalStyles.statsTitle;
    } else if (statsTitle) {
      statsTitle.style.removeProperty('gap');
    }

    // Restore heatmap labels
    originalStyles.weekdayLabels.forEach(({ text, x }) => {
      if (x != null) text.setAttribute('x', x);
    });

    originalStyles.monthLabels.forEach(({ text, y }) => {
      if (y != null) text.setAttribute('y', y);
    });
  }
}
