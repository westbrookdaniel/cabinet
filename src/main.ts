import { serve } from 'std/http/server.ts';
import { render, runtime } from '@/lib/render.ts';

function handler(req: Request): Response {
    const url = new URL(req.url);

    console.log(url.pathname);

    if (req.method !== 'GET') {
        return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    switch (url.pathname) {
        case '/lib/jsx-runtime':
            return new Response(new TextEncoder().encode(runtime), {
                headers: { 'Content-Type': 'application/javascript' },
            });
    }

    const html = render(url);
    return new Response(new TextEncoder().encode(html));
}

serve(handler, { port: 3000 });
