import { ComponentType } from '@/lib/types.ts';
import { VNode } from '@/lib/jsx-runtime';
import { DOMParser, Element, HTMLDocument } from 'deno-dom';

const TEMPLATE = await Deno.readTextFile('./src/index.html');

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

export function render(component: ComponentType): string {
    const vnode = component();

    const document = new DOMParser().parseFromString(TEMPLATE, 'text/html');
    if (!document?.documentElement) throw new Error('Failed to parse document template');

    document.body?.appendChild(createNode(document, vnode));

    return document.documentElement.outerHTML;
}
