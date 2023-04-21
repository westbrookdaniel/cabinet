import type { ModuleMap, ModuleType, Node, PageType } from '@/lib/types.ts';
import { traverse } from '@/lib/traverse.ts';
import { Status } from 'std/http/http_status.ts';
import { isFileForServerModule, isPageModule } from '@/lib/server/modules.ts';

const TEMPLATE = await Deno.readTextFile('./src/index.html');

export async function servePageModule(modules: ModuleMap<ModuleType>, url: URL, bundledFiles: string[]) {
    const path = url.pathname;
    const fileName = path === '/' ? 'index' : path.slice(1);

    try {
        if (isFileForServerModule(fileName)) throw new Error('Server only');
        await Deno.stat(`./src/pages/${fileName}.tsx`);
    } catch {
        const notFound = modules._404;
        if (!isPageModule(notFound)) throw new Error('Failed to load 404 page');
        return renderPage({
            component: notFound.default,
            fileName: '404',
            status: Status.NotFound,
            bundledFiles,
        });
    }

    const mod = modules[`_${fileName}`];

    if (!isPageModule(mod)) {
        throw new Error(`Couldnt find vaild component for ${path}`);
    }

    return renderPage({
        component: mod.default,
        fileName,
        status: Status.OK,
        bundledFiles,
    });
}

function renderPage(
    {
        component,
        fileName,
        status,
        bundledFiles,
    }: {
        component: PageType;
        fileName: string;
        status: Status;
        bundledFiles: string[];
    },
) {
    const uglyTemplate = TEMPLATE.replace(/<!--(.*?)-->|\s\B/gm, '');

    // TODO: Change how bundling works so this isn't on the fly and we have less duplication
    const script =
        `import h from '/_bundle/lib/hydrate.js';import p from '/_bundle/pages/${fileName}.js';h(p);`;

    const html = uglyTemplate.replace('{{app}}', wrapInRoot(serializeNode(component({}))))
        .replace(
            '{{scripts}}',
            `<script id='_page' type="module">${script}</script>${
                bundledFiles.filter((f) => f.endsWith('.map')).map((file) =>
                    `<link rel="preload" as="script" src="/_bundle${file}"></link>`
                )
                    .join('')
            }`,
        );

    return { html, status };
}

function serializeNode(node: Node): string {
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

const wrapInRoot = (html: string) => `<div id="_root">${html}</div>`;
