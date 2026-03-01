export const config = { runtime: 'edge' };

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

    const upstream = await fetch(parsed.toString(), {
        headers: { 'User-Agent': 'MastodonWrapped/1.0' },
    });

    if (!upstream.ok) {
        return new Response(`Upstream error: ${upstream.status}`, { status: upstream.status });
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
