import { createNode } from '@/lib/createNode.ts';
import { DOMParser } from 'deno-dom';
import type { ModuleMap } from '@/lib/types.ts';

const TEMPLATE = await Deno.readTextFile('./src/index.html');

async function getPageDataForPath(modules: ModuleMap, path: string) {
    const fileName = path === '/' ? 'index' : path.slice(1);

    try {
        await Deno.stat(`./src/pages/${fileName}.tsx`);
    } catch {
        return {
            component: modules._404,
            meta: modules._404.meta,
            fileName,
        };
    }

    const module = modules[`_${fileName}`];

    if (typeof module !== 'function') {
        throw new Error(`Couldnt find vaild component for ${path}`);
    }

    return {
        component: module,
        meta: module.meta,
        fileName,
    };
}

export async function render(modules: ModuleMap, url: URL): Promise<string> {
    const page = await getPageDataForPath(modules, url.pathname);
    const vnode = page.component({});

    const document = new DOMParser().parseFromString(TEMPLATE, 'text/html');
    if (!document?.documentElement) throw new Error('Failed to parse document template');

    document.body?.appendChild(createNode(document, vnode));

    if (page.meta?.hydrate) {
        const main = document.createElement('script');
        main.setAttribute('type', 'module');
        main.setAttribute('defer', '');
        main.textContent =
            `import h from './bundle/lib/hydrate.js';import p from './bundle/pages/${page.fileName}.js';h(p);`;
        document.head?.appendChild(main);
    }

    return document.documentElement.outerHTML;
}
