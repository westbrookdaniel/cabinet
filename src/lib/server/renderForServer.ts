import type { ModuleMap, Node } from '@/lib/types.ts';
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

async function getPageDataForPath(modules: ModuleMap, path: string) {
    const fileName = path === '/' ? 'index' : path.slice(1);

    try {
        await Deno.stat(`./src/pages/${fileName}.tsx`);
    } catch {
        const script = `import h from './bundle/lib/hydrate.js';import p from './bundle/pages/404.js';h(p);`;
        return { component: modules._404, script, status: Status.NotFound };
    }

    const module = modules[`_${fileName}`];

    if (typeof module !== 'function') {
        throw new Error(`Couldnt find vaild component for ${path}`);
    }

    const script =
        `import h from './bundle/lib/hydrate.js';import p from './bundle/pages/${fileName}.js';h(p);`;
    return { component: module, script, status: Status.OK };
}

const wrapInRoot = (html: string) => `<div id="_root">${html}</div>`;

export async function renderForServer(modules: ModuleMap, url: URL) {
    const { component, script, status } = await getPageDataForPath(modules, url.pathname);

    const uglyTemplate = TEMPLATE.replace(/<!--(.*?)-->|\s\B/gm, '');

    const html = uglyTemplate.replace('{{app}}', wrapInRoot(serializeNode(component({}))))
        .replace(
            '{{scripts}}',
            `<script id='_page' type="module">${script}</script>`,
        );

    return { html, status };
}
