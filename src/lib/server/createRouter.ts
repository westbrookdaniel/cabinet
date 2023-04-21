import { renderForServer } from '@/lib/server/renderForServer.ts';
import { serveDir } from 'std/http/file_server.ts';
import { ModuleMap } from '@/lib/types.ts';
import { serveBundle } from '@/lib/server/serveBundle.ts';
import { normalize } from 'std/path/posix.ts';
import { blue, green, yellow } from 'std/fmt/colors.ts';

export const createRouter = async (modules: ModuleMap) => {
    await generateModules();

    return async (req: Request): Promise<Response> => {
        const url = new URL(req.url);

        if (req.method !== 'GET') {
            const res = new Response('Method not allowed', { status: 405 });
            log(req, res);
            return res;
        }
        if (url.pathname.startsWith('/public')) {
            const res = await serveDir(req, { fsRoot: './public', urlRoot: 'public', quiet: true });
            log(req, res, 'file');
            return res;
        }
        if (url.pathname === '/favicon.ico') {
            const res = new Response(null, { status: 404 });
            log(req, res, 'file');
            return res;
        }
        if (url.pathname.startsWith('/bundle') && url.pathname.endsWith('.js')) {
            const res = await serveBundle(url.pathname.replace('/bundle/', ''));
            log(req, res, 'bundle');
            return res;
        }

        const { html, status } = await renderForServer(modules, url);
        const res = new Response(new TextEncoder().encode(html), { status });
        log(req, res, 'page');
        return res;
    };
};

async function generateModules() {
    const importStr: string[] = [];
    const exportStr: string[] = [];
    for await (const dirEntry of Deno.readDir('./src/pages')) {
        if (!dirEntry.isFile) return;
        const name = dirEntry.name.replace(/\.[^/.]+$/, '');
        const modName = name.replace('.', '_');
        importStr.push(`import * as _${modName} from './src/pages/${dirEntry.name}';`);
        exportStr.push(`_${modName}`);
    }

    const file = ` // This file is generated by src/lib/app.ts
${importStr.sort().join('\n')}

export const modules = {
    ${exportStr.sort().join(',\n    ')}
};
`;

    try {
        const currentFile = await Deno.readTextFile('./modules.gen.ts');
        const hasChanged = currentFile !== file;

        if (!hasChanged) return;
    } catch {
        // Ignore error, we'll just write the file
    }

    try {
        await Deno.writeTextFile('./modules.gen.ts', file);
    } catch {
        throw new Error(
            'Runtime module generation is not supported on this platform. Please commit the generated file.',
        );
    }
}

function log(req: Request, res: Response, type = 'other') {
    const d = new Date().toISOString();
    const dateFmt = `${d.slice(0, 10)} ${d.slice(11, 19)}`;
    const normalizedUrl = normalize(decodeURIComponent(new URL(req.url).pathname));
    let s = `[${dateFmt}] [${req.method}] [${type}] ${normalizedUrl} ${res.status}`;

    switch (type) {
        case 'page':
            s = blue(s);
            break;
        case 'bundle':
            s = yellow(s);
            break;
        case 'file':
            s = green(s);
            break;
    }

    console.debug(s);
}
