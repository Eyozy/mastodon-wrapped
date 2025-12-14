import { snapdom } from '@zumer/snapdom';

// CORS proxy list with fallback
const CORS_PROXIES = [
  'https://corsproxy.io/?',
  'https://api.allorigins.win/raw?url='
];

/**
 * Download the report as an image using snapdom
 * Uses multiple CORS proxies with fallback
 */
export async function downloadReportAsImage(elementId, filename, onProgress) {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Report element not found');
  }

  onProgress?.('Preparing capture...');

  // Store original styles for restoration
  const originalStyles = {
    weekdayLabels: [],
    monthLabels: [],
    elements: []
  };

  // Hide elements that shouldn't appear in download
  const elementsToHide = [
    '.heatmap-hover-text',
    '.back-button',
    '.download-button'
  ];

  elementsToHide.forEach(selector => {
    const el = element.querySelector(selector);
    if (el) {
      originalStyles.elements.push({ el, display: el.style.display });
      el.style.display = 'none';
    }
  });

  // Adjust heatmap labels for better spacing
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

  await new Promise(resolve => setTimeout(resolve, 150));
  onProgress?.('Rendering image...');

  try {
    // Try each proxy until one works
    let lastError = null;
    for (const proxy of CORS_PROXIES) {
      try {
        const result = await snapdom(element, { scale: 2, useProxy: proxy });
        onProgress?.('Downloading...');
        await result.download({ format: 'png', filename: filename.replace('.png', '') });
        onProgress?.('Complete');
        return;
      } catch (error) {
        lastError = error;
        console.warn(`Proxy ${proxy} failed, trying next...`);
      }
    }
    throw lastError || new Error('Download failed');
  } finally {
    // Restore all hidden elements
    originalStyles.elements.forEach(({ el, display }) => {
      el.style.display = display || '';
    });

    // Restore heatmap labels
    originalStyles.weekdayLabels.forEach(({ text, x }) => {
      if (x != null) text.setAttribute('x', x);
    });

    originalStyles.monthLabels.forEach(({ text, y }) => {
      if (y != null) text.setAttribute('y', y);
    });
  }
}
