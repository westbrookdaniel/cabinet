import type { ComponentType, Internals, Node } from '@/lib/types.ts';
import { traverse } from '@/lib/traverse.ts';

/**
 * Creates dom element from a node
 */
function renderNode(node: Node, previousEl: Element): Element {
    if (typeof node.type === 'function') {
        updateInternals(node, previousEl);
        return renderNode(node.type(node.attributes), previousEl);
    }

    // If the same type just replace the attributes
    // That way we can use it's context
    // TODO: Add a key to the node to improve this check
    const isSameElement = previousEl.tagName.toLowerCase() === node.type;
    const el: Element = isSameElement ? previousEl : document.createElement(node.type);
    applyAttributes(node, el);

    const children = node.attributes.children;
    const newChildren: (Element | Text)[] = [];
    if (children) {
        traverse(children, {
            node: (child, i) => {
                newChildren.push(renderNode(child, previousEl.children[i ?? 0]));
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
 * Map of elements to their internals
 */
const internalsInUse = new Map<Element, Internals['current']>();

/**
 * Creates new internals for the current node
 * If there is already an interanal in use for the hydrated
 * node's element it uses that instead
 */
function updateInternals(node: Node, el: Element) {
    if (internalsInUse.has(el)) {
        const internalsForNode = internalsInUse.get(el)!;
        // Clear the current context read for rendering
        internalsForNode.context = [];
        internals.current = internalsForNode;
    } else {
        const internalsForNode: Internals['current'] = {
            previousContext: null,
            context: [],
            register: (initialState) => {
                const localContext = internalsForNode.context;
                const key = localContext.length;
                localContext.push(initialState);
                return key;
            },
            set: (key, newValue) => {
                internalsForNode.context[key] = newValue;
                // Save the previous context
                internalsForNode.previousContext = [...internalsForNode.context];
                renderNode(node, el);
            },
            get: (key) => {
                if (internalsForNode.previousContext) return internalsForNode.previousContext[key];
                return internalsForNode.context[key];
            },
        };

        internalsInUse.set(el, internalsForNode);
        internals.current = internalsForNode;
    }
}

/**
 * Handle getting the internals
 */
export function getInternals(): Internals['current'] {
    if (typeof document !== 'undefined') {
        // @ts-ignore
        return window._internals.current;
    }
    const serverState: Record<number, any> = {};
    const serverInternals: Internals = {
        current: {
            context: [],
            previousContext: [],
            register: (state) => {
                const key = Math.random();
                serverState[key] = state;
                return key;
            },
            set: () => {
                throw new Error('Rendering is not supported in the server');
            },
            get: (key) => serverState[key],
        },
    };
    return serverInternals.current;
}

/**
 * Map of elements to their event listeners
 */
const listenersInUse = new Map<Element, [string, EventListenerOrEventListenerObject][]>();

/**
 * Applies attributes of a node to a dom element
 */
function applyAttributes(node: Node, el: Element) {
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
 */
export default function hydrate(component: ComponentType) {
    // @ts-ignore
    window._internals = internals;
    const root = document.body.children[0];
    const node = { type: component, attributes: {} };
    const el = renderNode(node, root);
    root.replaceWith(el);
}
