import type { ModuleMap, ModuleType } from '@/lib/types.ts';
import { isServerModule } from '@/lib/server/modules.ts';
import { Status } from 'std/http/http_status.ts';

const prefix = '/api';

export async function serveServerModule(modules: ModuleMap<ModuleType>, req: Request) {
    const url = new URL(req.url);
    const path = url.pathname.slice(prefix.length);
    const fileName = path === '/' ? 'index' : path.slice(1);

    try {
        await Deno.stat(`./src/pages/${fileName}.server.ts`);
    } catch {
        return new Response('Not Found', { status: Status.NotFound });
    }

    const mod = modules[`_${fileName}_server`];

    if (!isServerModule(mod)) {
        return new Response('Not Found', { status: Status.NotFound });
    }

    const method = req.method.toLowerCase();

    if (!(method in mod)) {
        return new Response('Method not allowed', { status: Status.MethodNotAllowed });
    }

    return mod[method as keyof typeof mod]!(req);
}
