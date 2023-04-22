import type { ModuleMap, ModuleType, Node, PageModule } from '@/lib/types.ts';
import { traverse } from '@/lib/traverse.ts';
import { Status } from 'std/http/http_status.ts';
import { isFileForServerModule, isPageModule } from '@/lib/server/modules.ts';
import { RouterHistory } from '@/lib/history.ts';

const TEMPLATE = (await Deno.readTextFile('./src/index.html')).replace(/<!--(.*?)-->|\s\B/gm, '');

export async function servePageModule(modules: ModuleMap<ModuleType>, url: URL, bundledFiles: string[]) {
    const path = url.pathname;
    const fileName = path === '/' ? 'index' : path.slice(1);

    // This allows you to always have access to the current url, even during ssr
    window.router = {
        href: url.href,
        pathname: url.pathname,
        search: url.search,
        hash: url.hash,
        state: null,
        // We cast this on purpose
    } as RouterHistory;

    try {
        if (isFileForServerModule(fileName)) throw new Error('Server only');
        await Deno.stat(`./src/pages/${fileName}.tsx`);
    } catch {
        const notFound = modules._404;
        if (!isPageModule(notFound)) throw new Error('Failed to load 404 page');
        return renderPage({
            mod: notFound,
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
        mod,
        fileName,
        status: Status.OK,
        bundledFiles,
    });
}

function renderPage(
    {
        mod,
        fileName,
        status,
        bundledFiles,
    }: {
        mod: PageModule;
        fileName: string;
        status: Status;
        bundledFiles: string[];
    },
) {
    const component = mod.default;
    const meta = component.meta || {};

    let html = TEMPLATE;

    // Handle meta and head tags
    // This is handled on the client too but we need to do it here for ssr
    html = html.replace(
        '{{head}}',
        [
            meta.title ? `<title>${meta.title}</title>` : null,
            meta.description ? `<meta name="description" content="${meta.description}">` : null,
            meta.image ? `<meta name="image" content="${meta.image}">` : null,
            ...bundledFiles.filter((f) => !f.endsWith('.map')).map((file) =>
                `<link rel="preload" as="script" src="/_bundle${file}"></link>`
            ),
        ].filter(Boolean).join(''),
    );

    // Handle page content
    html = html.replace('{{app}}', wrapInRoot(serializeNode(component({}))));

    // Handle page scripts
    const script =
        `import h from '/_bundle/lib/hydrate.js';import p from '/_bundle/pages/${fileName}.js';h(p);`;
    html = html.replace(
        '{{scripts}}',
        `<script id='_page' type="module">${script}</script>`,
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
