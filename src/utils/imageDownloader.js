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
  // 0. Pre-cleanup: Remove any existing clone containers from previous failed attempts
  const existingContainers = document.querySelectorAll('div[style*="left: -9999px"]');
  existingContainers.forEach(container => {
    if (container.querySelector('.download-mode')) {
      document.body.removeChild(container);
    }
  });

  const originalElement = document.getElementById(elementId);
  if (!originalElement) {
    throw new Error('Report element not found');
  }

  // Load snapdom dynamically
  const snapdom = await getSnapdom();

  onProgress?.('Preparing capture...');

  // 1. Create a clone of the element to modify safely
  const clone = originalElement.cloneNode(true);
  
  // 1.1 Add download-mode class to the clone for CSS targeting
  clone.classList.add('download-mode');
  
  // 2. Setup an off-screen container for the clone
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.top = '0';
  container.style.left = '-9999px';
  container.style.width = `${originalElement.offsetWidth}px`; // Maintain width
  container.style.zIndex = '-1000';
  
  // Add clone to container, and container to body
  container.appendChild(clone);
  document.body.appendChild(container);

  try {
    // 3. Modify the CLONE styles specifically for the image
    
    // 3.1 Reduce gap between header and cards
    const statsHeader = clone.querySelector('.stats-header');
    if (statsHeader) {
      statsHeader.style.marginBottom = '1rem'; // Force small margin in image
    }

    // 3.2 Hide year selector completely (redundant with exclude, but safer)
    const yearSelector = clone.querySelector('.year-selector');
    if (yearSelector) {
      yearSelector.style.display = 'none';
    }

    // 3.2.1 Hide timezone selector (redundant with exclude, but safer)
    const timezoneSelector = clone.querySelector('.timezone-selector');
    if (timezoneSelector) {
      timezoneSelector.style.display = 'none';
    }

    // 3.3 Remove gap in stats title if exists
    const statsTitle = clone.querySelector('.stats-title');
    if (statsTitle) {
      statsTitle.style.gap = '0';
    }

    // Heatmap label adjustments moved to CSS (.download-mode) for stability

    // Inline heatmap SVG colors for reliable PNG export
    // (Some DOM capture engines can miss CSS-driven SVG styling.)
    const heatmapRects = clone.querySelectorAll('.react-calendar-heatmap rect');
    heatmapRects.forEach((rect) => {
      const style = window.getComputedStyle(rect);
      const fill = style.fill;
      const stroke = style.stroke;
      const strokeWidth = style.strokeWidth;

      if (fill && fill !== 'none') {
        rect.setAttribute('fill', fill);
        rect.style.fill = fill;
      }
      if (stroke && stroke !== 'none') {
        rect.setAttribute('stroke', stroke);
        rect.style.stroke = stroke;
      }
      if (strokeWidth) {
        rect.setAttribute('stroke-width', strokeWidth);
        rect.style.strokeWidth = strokeWidth;
      }
    });

    // Wait for layout to settle
    await new Promise(resolve => setTimeout(resolve, 50));
    onProgress?.('Rendering image...');

    // Try each proxy until one works
    let lastError = null;
    let errorCount = 0;

    for (const proxy of CORS_PROXIES) {
      try {
        // Use snapdom's exclude option to hide buttons in the snapshot
        const result = await snapdom(clone, {
          scale: 2,
          useProxy: proxy,
          exclude: ['.heatmap-hover-text', '.back-button', '.download-button', '.year-selector', '.timezone-selector'],
          excludeMode: 'remove'
        });
        onProgress?.('Downloading...');
        await result.download({ format: 'png', filename: filename.replace('.png', '') });
        onProgress?.('Complete');
        return;
      } catch (error) {
        lastError = error;
        errorCount++;

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

    // All proxies failed
    if (lastError) {
      const isCORSError = lastError.message?.includes('CORS') ||
                         lastError.message?.includes('cross-origin');

      const isNetworkError = lastError.message?.includes('network') ||
                            lastError.message?.includes('fetch');

      if (isCORSError) {
        throw new Error('Download failed due to network firewall or CORS restrictions. Please try again later.');
      } else if (isNetworkError) {
        throw new Error('Download failed due to network issues. Please check your internet connection.');
      } else {
        throw new Error(`Download failed: ${lastError.message || 'Unknown error'}. Please try again.`);
      }
    }

    throw new Error('Download failed: All image download proxies are unavailable.');
  } finally {
    // 4. Clean up: Remove the cloned container
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
    // No need to restore styles on originalElement since we never touched it
  }
}
