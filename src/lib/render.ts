import { createNode, isComponentType } from '@/lib/jsx-runtime';
import { DOMParser } from 'deno-dom';
import { bundleFile } from '@/lib/bundle.ts';
import type { ModuleMap, PageData, PageDataMap } from '@/lib/types.ts';

const TEMPLATE = await Deno.readTextFile('./src/index.html');

export const runtime = await bundleFile(`./jsx-runtime.ts`);
export const hydrate = await bundleFile(`./hydrate.ts`);

async function createPageMap(modules: ModuleMap) {
    const pageMap: PageDataMap = {};
    for await (const dirEntry of Deno.readDir('./src/pages')) {
        if (dirEntry.isFile) {
            const file = await bundleFile(`../pages/${dirEntry.name}`);
            const module = modules[`_${dirEntry.name.replace('.tsx', '')}`];

            if (!isComponentType(module)) {
                throw new Error(`Module ${dirEntry.name} does not default export a valid component`);
            }

            let pathName = dirEntry.name.split('.')[0];
            if (pathName === 'index') pathName = '/';
            pageMap[pathName] = {
                component: module,
                meta: module.meta,
                file,
            };
        }
    }
    return pageMap;
}

async function getComponentForPath(modules: ModuleMap, path: string): Promise<PageData> {
    const pageMap = await createPageMap(modules);
    const page = pageMap[path] || pageMap['404'];
    if (!page) throw new Error(`No 404 page found`);
    return page;
}

export async function render(modules: ModuleMap, url: URL): Promise<string> {
    const page = await getComponentForPath(modules, url.pathname);
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
