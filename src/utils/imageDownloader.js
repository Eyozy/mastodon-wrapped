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
 *
 * NOTE: This function expects the element to already be properly styled for export
 * (e.g., using the Ghost component pattern with force-desktop class)
 */
export async function downloadReportAsImage(elementId, filename, onProgress) {
  const targetElement = document.getElementById(elementId);
  if (!targetElement) {
    throw new Error('Report element not found');
  }

  // Load snapdom dynamically
  const snapdom = await getSnapdom();

  onProgress?.('Preparing capture...');

  // Inline heatmap SVG colors for reliable PNG export
  // (Some DOM capture engines can miss CSS-driven SVG styling.)
  const heatmapRects = targetElement.querySelectorAll('.react-calendar-heatmap rect');
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
      // Use snapdom's exclude option to hide hover elements in the snapshot
      const result = await snapdom(targetElement, {
        scale: 2,
        useProxy: proxy,
        exclude: ['.heatmap-hover-text'],
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
}
