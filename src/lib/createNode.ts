import type { Node } from '@/lib/types.ts';
import type { Element, HTMLDocument } from 'deno-dom';
import { traverse } from '@/lib/tranverse.ts';

export function createNode(document: HTMLDocument, vnode: Node<keyof HTMLElementTagNameMap>): Element {
    const children = vnode.attributes.children;
    const el = document.createElement(vnode.nodeName);

    if (children) {
        traverse(children, {
            node: (child) => el.appendChild(createNode(document, child)),
            string: (child) => el.appendChild(document?.createTextNode(child)),
        });
    }

    Object.entries(vnode.attributes).forEach(([key, value]) => {
        if (value === undefined) return; // Ignore undefined
        if (key === 'children') return;
        if (key.startsWith('on') && typeof value === 'function') {
            el.addEventListener(key.slice(2), value as EventListener);
            return;
        }
        el.setAttribute(key, value);
    });

    return el;
}
