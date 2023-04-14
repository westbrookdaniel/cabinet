import { ModuleMap, render, runtime } from '@/lib/render.ts';

export const createApp = async (modules: ModuleMap) => {
    await generateModules();

    return async (req: Request): Promise<Response> => {
        if (req.method !== 'GET') {
            return Response.json({ error: 'Method not allowed' }, { status: 405 });
        }

        const url = new URL(req.url);

        switch (url.pathname) {
            case '/lib/jsx-runtime':
                return new Response(new TextEncoder().encode(runtime), {
                    headers: { 'Content-Type': 'application/javascript' },
                });
        }

        const html = await render(modules, url);
        return new Response(new TextEncoder().encode(html));
    };
};

async function generateModules() {
    let importStr = '';
    let exportStr = '';
    for await (const dirEntry of Deno.readDir('./src/pages')) {
        if (!dirEntry.isFile) return;
        const name = dirEntry.name.replace('.tsx', '');
        importStr += `import _${name} from './src/pages/${name}.tsx';`;
        exportStr += `_${name},`;
    }

    const file = ` // This file is generated by src/lib/app.ts
${importStr}
export const modules = {${exportStr}};
`;

    const currentFile = await Deno.readTextFile('./modules.gen.ts');
    const hasChanged = currentFile !== file;

    if (!hasChanged) return;

    try {
        await Deno.writeTextFile('./modules.gen.ts', file);
    } catch {
        throw new Error(
            'Runtime module generation is not supported on this platform. Please commit the generated file.',
        );
    }
}
