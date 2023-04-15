import type { Element, HTMLDocument } from 'deno-dom';
import type { ComponentType, Node } from '@/lib/types.ts';

export function isComponentType(value: unknown): value is ComponentType {
    return typeof value === 'function';
}

export function jsx<K extends keyof HTMLElementTagNameMap>(
    elementType: K | ComponentType,
    // TODO: fix this
    // deno-lint-ignore no-explicit-any
    attributes: any, // children is Node
): Node<K> {
    if (typeof elementType === 'function') {
        return elementType(attributes);
    }
    return { nodeName: elementType, attributes };
}

export function jsxs<K extends keyof HTMLElementTagNameMap>(
    elementType: K | ComponentType,
    // TODO: fix this
    // deno-lint-ignore no-explicit-any
    attributes: any, // children is Node[]
): Node<K> {
    if (typeof elementType === 'function') {
        return elementType(attributes);
    }
    return { nodeName: elementType, attributes };
}

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
