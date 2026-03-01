// Dynamic import: only load snapdom when user clicks download (~91KB saved from initial bundle)
const getSnapdom = () => import('@zumer/snapdom').then(m => m.snapdom);

/**
 * Download the report as an image using snapdom.
 * NOTE: Expects the element to already be properly styled for export
 * (e.g., using the Ghost component pattern with force-desktop class)
 */
export async function downloadReportAsImage(elementId, filename, onProgress) {
  const targetElement = document.getElementById(elementId);
  if (!targetElement) throw new Error('Report element not found');

  const snapdom = await getSnapdom();

  onProgress?.('Preparing capture...');

  // Inline heatmap SVG colors for reliable PNG export
  // (Some DOM capture engines can miss CSS-driven SVG styling.)
  targetElement.querySelectorAll('.react-calendar-heatmap rect').forEach((rect) => {
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

  await new Promise(resolve => setTimeout(resolve, 50));
  onProgress?.('Rendering image...');

  const result = await snapdom(targetElement, {
    scale: 2,
    useProxy: '/api/avatar-proxy?url=',
    exclude: ['.heatmap-hover-text'],
    excludeMode: 'remove',
  });

  onProgress?.('Downloading...');
  await result.download({ format: 'png', filename: filename.replace('.png', '') });
  onProgress?.('Complete');
}
