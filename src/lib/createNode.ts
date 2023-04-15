import type { Node } from '@/lib/types.ts';
import type { Element, HTMLDocument } from 'deno-dom';

export function createNode(document: HTMLDocument, vnode: Node<keyof HTMLElementTagNameMap>): Element {
    const children = vnode.attributes.children;
    const el = document.createElement(vnode.nodeName);
    if (typeof children === 'string') {
        el.appendChild(document?.createTextNode(children));
    } else if (Array.isArray(children)) {
        children.forEach((child) => {
            if (typeof child === 'string') {
                el?.appendChild(document.createTextNode(child));
            } else {
                el?.appendChild(createNode(document, child));
            }
        });
    } else {
        if (typeof children === 'string') {
            el?.appendChild(document.createTextNode(children));
        } else {
            el?.appendChild(createNode(document, children));
        }
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
