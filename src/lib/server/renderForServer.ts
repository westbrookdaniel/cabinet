import type { ModuleMap, ModuleType, Node, PageModule, PageType } from '@/lib/types.ts';
import { traverse } from '@/lib/traverse.ts';
import { Status } from 'std/http/http_status.ts';

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

export async function renderForServer(modules: ModuleMap<ModuleType>, url: URL) {
    const path = url.pathname;
    const fileName = path === '/' ? 'index' : path.slice(1);

    try {
        if (fileName.includes('.server')) throw new Error('Server only');
        await Deno.stat(`./src/pages/${fileName}.tsx`);
    } catch {
        const notFound = modules._404;
        if (!isPageModule(notFound)) throw new Error('Failed to load 404 page');
        return renderPage({ component: notFound.default, fileName: '404', status: Status.NotFound });
    }

    const mod = modules[`_${fileName}`];

    if (!isPageModule(mod)) {
        throw new Error(`Couldnt find vaild component for ${path}`);
    }

    return renderPage({ component: mod.default, fileName, status: Status.OK });
}

function renderPage(
    { component, fileName, status }: { component: PageType; fileName: string; status: Status },
) {
    const uglyTemplate = TEMPLATE.replace(/<!--(.*?)-->|\s\B/gm, '');

    const script =
        `import h from './bundle/lib/hydrate.js';import p from './bundle/pages/${fileName}.js';h(p);`;

    const html = uglyTemplate.replace('{{app}}', wrapInRoot(serializeNode(component({}))))
        .replace(
            '{{scripts}}',
            `<script id='_page' type="module">${script}</script>`,
        );

    return { html, status };
}

function isPageModule(module: ModuleType): module is PageModule {
    return 'default' in module && typeof module.default === 'function';
}

// function isServerModule(module: ModuleType): module is PageModule {
//     return 'get' in module || 'post' in module;
// }

const wrapInRoot = (html: string) => `<div id="_root">${html}</div>`;
