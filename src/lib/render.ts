import { ComponentType, isComponentType } from '@/lib/types.ts';
import { VNode } from '@/lib/jsx-runtime';
import { DOMParser, Element, HTMLDocument } from 'deno-dom';
import * as esbuild from 'esbuild';

const TEMPLATE = await Deno.readTextFile('./src/index.html');

interface Page {
    component: ComponentType;
    file: string;
}

const rawRuntime = await Deno.readTextFile(`./src/lib/jsx-runtime.ts`);
export const runtime = (await esbuild.transform(rawRuntime, {
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
            jsxImportSource: './lib',
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
        };
    }
}
esbuild.stop();

function getComponentForPath(path: string): Page {
    const page = pageMap[path] || pageMap['404'];
    if (!page) throw new Error(`No 404 page found`);
    return page;
}

function createNode(document: HTMLDocument, vnode: VNode<keyof HTMLElementTagNameMap>): Element {
    const children = vnode.attributes.children;
    const el = document.createElement(vnode.nodeName);
    if (typeof children === 'string') {
        el.appendChild(document?.createTextNode(children));
    } else {
        children.forEach((child) => {
            if (typeof child === 'string') {
                el?.appendChild(document.createTextNode(child));
            } else {
                el?.appendChild(createNode(document, child));
            }
        });
    }

    Object.entries(vnode.attributes).forEach(([key, value]) => {
        if (key === 'children') return;
        if (key.startsWith('on') && typeof value === 'function') {
            el.addEventListener(key.slice(2), value as EventListener);
            return;
        }
        el.setAttribute(key, value);
    });

    return el;
}

export function render(url: URL): string {
    const page = getComponentForPath(url.pathname);
    const vnode = page.component();

    const document = new DOMParser().parseFromString(TEMPLATE, 'text/html');
    if (!document?.documentElement) throw new Error('Failed to parse document template');

    document.body?.appendChild(createNode(document, vnode));

    const bundle = document.createElement('script');
    bundle.setAttribute('type', 'module');
    bundle.innerHTML = page.file;
    document.body?.appendChild(bundle);

    return document.documentElement.outerHTML;
}
