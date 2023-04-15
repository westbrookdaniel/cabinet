import type { Element, HTMLDocument } from 'deno-dom';
import type { ComponentType, VNode } from '@/lib/types.ts';

export function isComponentType(value: unknown): value is ComponentType {
    return typeof value === 'function';
}

export function jsx<K extends keyof HTMLElementTagNameMap>(
    nodeName: K,
    // TODO: fix this
    // deno-lint-ignore no-explicit-any
    attributes: any, // children is string
): VNode<K> {
    return { nodeName, attributes };
}

export function jsxs<K extends keyof HTMLElementTagNameMap>(
    nodeName: K,
    // TODO: fix this
    // deno-lint-ignore no-explicit-any
    attributes: any, // children is VNode[]
): VNode<K> {
    return { nodeName, attributes };
}

export function createNode(document: HTMLDocument, vnode: VNode<keyof HTMLElementTagNameMap>): Element {
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
