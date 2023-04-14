import { serve } from 'std/http/server.ts';
import { ComponentType, isComponentType } from '@/lib/types.ts';
import { render } from '@/lib/render.ts';

const pageMap: Record<string, ComponentType> = {};
for (const dirEntry of Deno.readDirSync('./src/pages')) {
    if (dirEntry.isFile) {
        const module = await import(`./pages/${dirEntry.name}`);
        if (!isComponentType(module.default)) {
            throw new Error(`Module ${dirEntry.name} does not default export a valid component`);
        }
        let pathName = dirEntry.name.split('.')[0];
        if (pathName === 'index') pathName = '/';
        pageMap[pathName] = module.default;
    }
}

function getComponentForPath(path: string): ComponentType {
    const page = pageMap[path] || pageMap['404'];
    if (!page) throw new Error(`No 404 page found`);
    return page;
}

function handler(req: Request): Response {
    if (req.method !== 'GET') {
        return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    const url = new URL(req.url);
    const component = getComponentForPath(url.pathname);
    const html = render(component);

    return new Response(new TextEncoder().encode(html));
}

serve(handler, { port: 3000 });
