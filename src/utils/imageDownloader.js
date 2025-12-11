import { toPng } from 'html-to-image';

/**
 * Download the report as an image
 * @param {string} elementId - The ID of the element to capture
 * @param {string} filename - The filename for the downloaded image
 * @param {Function} onProgress - Progress callback
 */
export async function downloadReportAsImage(elementId, filename, onProgress) {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Report element not found');
    }

    onProgress && onProgress('Preparing capture...');

    // Manually force style changes to ensuring correct capturing 
    // especially for SVG elements which html-to-image might struggle with external CSS transforms on
    const heatmapLabels = document.querySelectorAll('.react-calendar-heatmap-weekday-labels');
    const originalTransforms = new Map();

    heatmapLabels.forEach((el) => {
      originalTransforms.set(el, el.style.transform);
      // Force move left by 30px to create spacing
      el.style.transform = 'translateX(-30px)';
    });

    // Wait for any animations and style applications
    await new Promise(resolve => setTimeout(resolve, 800));

    onProgress && onProgress('Rendering image...');

    try {
      // Use html-to-image
      const dataUrl = await toPng(element, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        filter: (node) => {
          // Filter out buttons and controls
          if (node.tagName === 'BUTTON') return false;
          if (node.classList && (
            node.classList.contains('back-button') ||
            node.classList.contains('language-switcher') ||
            node.classList.contains('back-to-top-btn') ||
            node.id === 'download-btn'
          )) {
            return false;
          }
          return true;
        },
        style: {
          padding: '40px',
          background: 'white',
          // Force minimum desktop width to ensure consistent layout
          minWidth: '1000px',
          maxWidth: '1200px',
          margin: '0 auto'
        }
      });

      onProgress && onProgress('Downloading...');

      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      onProgress && onProgress('Complete');

    } finally {
      // Restore original styles
      heatmapLabels.forEach((el) => {
        el.style.transform = originalTransforms.get(el);
      });
    }

  } catch (error) {
    console.error('Error downloading image:', error);
    throw error;
  }
}