// Dynamic import: only load snapdom when user clicks download (~91KB saved from initial bundle)
const getSnapdom = () => import('@zumer/snapdom').then((m) => m.snapdom);

/**
 * Download the report as an image using snapdom.
 * NOTE: Expects the element to already be properly styled for export
 * (e.g., using the Ghost component pattern with force-desktop class)
 */
export async function downloadReportAsImage(elementId, filename, onProgress) {
  const targetElement = document.getElementById(elementId);
  if (!targetElement) throw new Error('Report element not found');

  targetElement.classList.add('download-mode');

  const savedAttrs = [];

  try {
    const snapdom = await getSnapdom();

    onProgress?.('Preparing capture...');

    // Inline heatmap SVG colors for reliable PNG export
    targetElement
      .querySelectorAll('.react-calendar-heatmap rect')
      .forEach((rect) => {
        const prev = {
          node: rect,
          fill: rect.getAttribute('fill'),
          stroke: rect.getAttribute('stroke'),
          strokeWidth: rect.getAttribute('stroke-width'),
          styleFill: rect.style.fill,
          styleStroke: rect.style.stroke,
        };
        savedAttrs.push(prev);

        const style = window.getComputedStyle(rect);
        const { fill, stroke, strokeWidth } = style;
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
        }
      });

    targetElement
      .querySelectorAll(
        '.react-calendar-heatmap-weekday-labels, .react-calendar-heatmap-month-labels, .react-calendar-heatmap-month-labels text'
      )
      .forEach((node) => {
        const prevTransform = node.getAttribute('transform');
        const computedTransform = window.getComputedStyle(node).transform;
        if (!computedTransform || computedTransform === 'none') return;
        savedAttrs.push({ node, transform: prevTransform });
        node.setAttribute('transform', computedTransform);
      });

    await new Promise((resolve) => setTimeout(resolve, 50));
    onProgress?.('Rendering image...');

    const exportScale = Math.min(4, Math.max(3, window.devicePixelRatio || 1));

    const result = await snapdom(targetElement, {
      scale: exportScale,
      useProxy: '/api/avatar-proxy?url=',
      exclude: ['.heatmap-hover-text'],
      excludeMode: 'remove',
    });

    onProgress?.('Downloading...');
    await result.download({
      format: 'png',
      filename: filename.replace('.png', ''),
    });
    onProgress?.('Complete');
  } finally {
    targetElement.classList.remove('download-mode');
    for (const entry of savedAttrs) {
      if ('transform' in entry) {
        if (entry.transform === null) entry.node.removeAttribute('transform');
        else entry.node.setAttribute('transform', entry.transform);
      } else {
        const { node } = entry;
        const restore = (attr, val) =>
          val === null ? node.removeAttribute(attr) : node.setAttribute(attr, val);
        restore('fill', entry.fill);
        restore('stroke', entry.stroke);
        restore('stroke-width', entry.strokeWidth);
        node.style.fill = entry.styleFill;
        node.style.stroke = entry.styleStroke;
      }
    }
  }
}
