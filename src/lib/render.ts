import type { ComponentType, Internals, Node } from '@/lib/types.ts';
import { traverse } from '@/lib/traverse.ts';

/**
 * Creates dom element from a node
 */
export function renderNode(
    previousEl: HTMLElement | undefined,
    node: Node,
): HTMLElement {
    // If it's a component call it's render function
    if (typeof node.type === 'function') {
        return renderNode(previousEl, node.type(node.attributes));
    }

    // Assume they're different unless a data-key is provided
    // This is only really useful for lists, and even then
    // this version won't work if you append to the start of the list
    const dataId = node.attributes['data-id'];
    const isSameElement = dataId !== undefined && previousEl?.dataset.id === dataId;

    // Don't create a new element if it's the same
    const el: HTMLElement = isSameElement ? previousEl : document.createElement(node.type);

    // If we made a new element, put it in the dom
    if (!isSameElement) previousEl?.replaceChildren(el);

    applyAttributes(node, el);

    const children = node.attributes.children;
    const newChildren: (HTMLElement | Text)[] = [];
    if (children) {
        traverse(children, {
            node: (child, i) => {
                newChildren.push(renderNode(previousEl?.children[i ?? 0] as HTMLElement, child));
            },
            string: (child) => {
                newChildren.push(document.createTextNode(child));
            },
        });
    }
    el.replaceChildren(...newChildren);

    return el;
}

export const internals: Internals = {
    current: {
        context: [],
        previousContext: [],
        render: () => {
            throw new Error('Render function not set');
        },
        register: () => {
            throw new Error('Register function not set');
        },
        set: () => {
            throw new Error('Set function not set');
        },
        get: () => {
            throw new Error('Get function not set');
        },
    },
};

/**
 * Map of elements to their event listeners
 * TODO: Add some manual cleanup for listeners when the element is removed
 */
const listenersInUse = new WeakMap<HTMLElement, [string, EventListenerOrEventListenerObject][]>();

/**
 * Applies attributes of a node to a dom element
 */
function applyAttributes(node: Node, el: HTMLElement) {
    // Remove old listeners
    if (listenersInUse.has(el)) {
        const oldListeners = listenersInUse.get(el)!;
        oldListeners.forEach(([eventType, listener]) => {
            el.removeEventListener(eventType, listener);
        });
        // Remove from listeners in use
        listenersInUse.delete(el);
    }

    // Apply attributes
    // Any code that modifies the dom will be run too
    Object.entries(node.attributes).forEach(([key, value]) => {
        if (key === 'children') return;
        if (value === undefined) return;
        if (key.startsWith('on') && typeof value === 'function') {
            const eventType = key.slice(2);
            el.addEventListener(eventType, value as EventListener);

            // Add to listeners in use for cleanup next time
            if (!listenersInUse.has(el)) {
                listenersInUse.set(el, [[eventType, value]]);
            } else {
                listenersInUse.get(el)!.push([eventType, value]);
            }
        }
        el.setAttribute(key, value);
    });
}

/**
 * Hydrates the dom elements with our component
 * Can sometimes just be a render but let's call it hydrate
 */
export default function hydrate(component: ComponentType) {
    window._internals = internals;
    const root = document.getElementById('_root');
    if (!root) throw new Error('Root element not found');
    const node = { type: component, attributes: {} };
    const el = renderNode(root, node);
    root.replaceWith(el);
}
