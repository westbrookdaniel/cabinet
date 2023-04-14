import { ComponentType, createNode, isComponentType } from '@/lib/jsx-runtime';
import { DOMParser } from 'deno-dom';
import * as esbuild from 'esbuild';
import { denoPlugin } from 'esbuild-deno-loader';

const TEMPLATE = await Deno.readTextFile('./src/index.html');

interface PageMeta {
    hydrate?: boolean;
}

interface Page {
    component: ComponentType;
    file: string;
    meta?: PageMeta;
}

const bundleFile = async (sourcefile: string) => {
    const result = await esbuild.build({
        entryPoints: [import.meta.resolve(sourcefile)],
        bundle: true,
        format: 'esm',
        jsx: 'automatic',
        treeShaking: true,
        // TODO: Fix identifiers
        // minify: true,
        minifyWhitespace: true,
        // minifyIdentifiers: true,
        absWorkingDir: Deno.cwd(),
        jsxImportSource: '@/lib',
        outdir: '.',
        outfile: '',
        platform: 'browser',
        plugins: [denoPlugin({
            importMapURL: new URL('../../import_map.json', import.meta.url),
        })],
        write: false,
        loader: {
            '.ts': 'ts',
            '.tsx': 'tsx',
        },
    });
    if (result.warnings.length) {
        console.error(result.warnings);
    }
    const output = result.outputFiles?.[0]?.text;

    if (!output) throw new Error(`Failed to transform`);

    return output;
};

export const runtime = await bundleFile(`./jsx-runtime.ts`);
export const hydrate = await bundleFile(`./hydrate.ts`);

const pageMap: Record<string, Page> = {};
for (const dirEntry of Deno.readDirSync('./src/pages')) {
    if (dirEntry.isFile) {
        const file = await bundleFile(`../pages/${dirEntry.name}`);

        const module = await import(`../pages/${dirEntry.name}`);
        if (!isComponentType(module.default)) {
            throw new Error(`Module ${dirEntry.name} does not default export a valid component`);
        }

        let pathName = dirEntry.name.split('.')[0];
        if (pathName === 'index') pathName = '/';
        pageMap[pathName] = {
            component: module.default,
            meta: module.meta,
            file,
        };
    }
}

function getComponentForPath(path: string): Page {
    const page = pageMap[path] || pageMap['404'];
    if (!page) throw new Error(`No 404 page found`);
    return page;
}

export function render(url: URL): string {
    const page = getComponentForPath(url.pathname);
    const vnode = page.component();

    const document = new DOMParser().parseFromString(TEMPLATE, 'text/html');
    if (!document?.documentElement) throw new Error('Failed to parse document template');

    document.body?.appendChild(createNode(document, vnode));

    if (page.meta?.hydrate) {
        const bundle = document.createElement('script');
        bundle.setAttribute('type', 'module');
        bundle.innerHTML = page.file;
        bundle.innerHTML += `window.component = ${page.component.name};`;
        bundle.innerHTML += hydrate;

        // TODO: Fix import paths
        bundle.innerHTML = bundle.innerHTML.replace(/@\/lib/g, './lib');

        document.body?.appendChild(bundle);
    }

    return document.documentElement.outerHTML;
}
