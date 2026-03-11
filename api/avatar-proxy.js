export const config = { runtime: 'edge' };

const PRIVATE_HOST_RE =
  /^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|169\.254\.|0\.0\.0\.0|::1$|fc00:|fe80:)/i;

function isPrivateHost(hostname) {
  return PRIVATE_HOST_RE.test(hostname);
}

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');

  if (!url) {
    return new Response('Missing url parameter', { status: 400 });
  }

  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return new Response('Invalid URL', { status: 400 });
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return new Response('Only http/https URLs are allowed', { status: 400 });
  }

  if (isPrivateHost(parsed.hostname)) {
    return new Response('Forbidden', { status: 403 });
  }

  const upstream = await fetch(parsed.toString(), {
    headers: { 'User-Agent': 'MastodonWrapped/1.0' },
  });

  if (!upstream.ok) {
    return new Response(`Upstream error: ${upstream.status}`, {
      status: upstream.status,
    });
  }

  const contentType = upstream.headers.get('content-type') ?? 'image/jpeg';
  const body = await upstream.arrayBuffer();

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
