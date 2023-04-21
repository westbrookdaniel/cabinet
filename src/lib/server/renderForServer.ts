import type { ModuleMap, Node } from '@/lib/types.ts';
import { traverse } from '@/lib/traverse.ts';

const TEMPLATE = await Deno.readTextFile('./src/index.html');

export function serializeNode(node: Node): string {
    if (typeof node.type === 'function') {
        return serializeNode(node.type(node.attributes));
    }

    const children = node.attributes.children;
    let childrenStr = '';
    if (children) {
        traverse(children, {
            node: (child) => childrenStr += serializeNode(child),
            string: (child) => childrenStr += child,
        });
    }

    let attributeStr = '';
    Object.entries(node.attributes).forEach(([key, value]) => {
        if (value === undefined) return; // Ignore undefined
        if (key === 'children') return; // Ignore children
        if (key.startsWith('on')) return; // Ignore events
        attributeStr += ` ${key}="${value}"`;
    });

    return `<${node.type}${attributeStr}>${childrenStr}</${node.type}>`;
}

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

const wrapInRoot = (html: string) => `<div id="_root">${html}</div>`;

export async function renderForServer(modules: ModuleMap, url: URL): Promise<string> {
    const page = await getPageDataForPath(modules, url.pathname);

    const shouldHydrate = page.meta?.hydrate !== false;
    const noSsr = page.meta?.noSsr === true;

    const uglyTemplate = TEMPLATE.replace(/<!--(.*?)-->|\s\B/gm, '');

    return uglyTemplate.replace('{{app}}', wrapInRoot(noSsr ? '' : serializeNode(page.component({}))))
        .replace(
            '{{scripts}}',
            shouldHydrate
                ? `<script id='_page' type="module">import h from './bundle/lib/render.js';import p from './bundle/pages/${page.fileName}.js';h(p);</script>`
                : '',
        );
}
