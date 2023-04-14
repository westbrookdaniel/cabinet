import { ComponentType, createNode, isComponentType } from '@/lib/jsx-runtime';
import { DOMParser } from 'deno-dom';
import * as esbuild from 'esbuild';

const TEMPLATE = await Deno.readTextFile('./src/index.html');

interface PageMeta {
    hydrate?: boolean;
}

interface Page {
    component: ComponentType;
    file: string;
    meta?: PageMeta;
}

const rawRuntime = await Deno.readTextFile(`./src/lib/jsx-runtime.ts`);
export const runtime = (await esbuild.transform(rawRuntime, {
    loader: 'ts',
    format: 'esm',
})).code;

const rawHydrate = await Deno.readTextFile(`./src/lib/hydrate.ts`);
export const hydrate = (await esbuild.transform(rawHydrate, {
    loader: 'ts',
    format: 'esm',
})).code;

const pageMap: Record<string, Page> = {};
for (const dirEntry of Deno.readDirSync('./src/pages')) {
    if (dirEntry.isFile) {
        const raw = await Deno.readTextFile(`./src/pages/${dirEntry.name}`);
        const res = await esbuild.transform(raw, {
            loader: 'tsx',
            format: 'esm',
            jsx: 'automatic',
            jsxImportSource: '@/lib',
        });
        if (res.warnings.length) console.warn(res.warnings);

        const module = await import(`../pages/${dirEntry.name}`);
        if (!isComponentType(module.default)) {
            throw new Error(`Module ${dirEntry.name} does not default export a valid component`);
        }

        let pathName = dirEntry.name.split('.')[0];
        if (pathName === 'index') pathName = '/';
        pageMap[pathName] = {
            component: module.default,
            file: res.code,
            meta: module.meta,
        };
    }
}

esbuild.stop();

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
