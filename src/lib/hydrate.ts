import type { ComponentType, Internals, Node } from '@/lib/types.ts';
import { traverse } from '@/lib/traverse.ts';

/**
 * Creates dom element from a node
 */
function renderNode(
    node: Node,
    previousEl: Element | undefined,
    setElement?: (el: Element) => void,
): Element {
    // If it's a component call it's render function
    // If we don't have a previous element we need to create a new one
    // so we have to set the element for the internals after it's created
    if (typeof node.type === 'function') {
        const setElement = updateInternals(node, previousEl);
        return renderNode(node.type(node.attributes), previousEl, setElement);
    }

    // If the same type just replace the attributes
    // That way we can use it's context
    // TODO: Add a key to the node to improve this check
    const isSameElement = previousEl?.tagName.toLowerCase() === node.type;
    const el: Element = isSameElement ? previousEl : document.createElement(node.type);
    applyAttributes(node, el);
    // If we have a set element callback call it to update the internals
    if (setElement) setElement(el);

    const children = node.attributes.children;
    const newChildren: (Element | Text)[] = [];
    if (children) {
        traverse(children, {
            node: (child, i) => {
                newChildren.push(renderNode(child, previousEl?.children[i ?? 0]));
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
 * Map of elements to their internals
 * TODO: Add some manual cleanup for internals when the element is removed
 */
const internalsInUse = new WeakMap<Element, Internals['current']>();

/**
 * Creates new internals for the current node
 * If there is already an interanal in use for the hydrated
 * node's element it uses that instead
 */
function updateInternals(node: Node, el?: undefined): (el: Element) => void;
function updateInternals(node: Node, el: Element): undefined;
function updateInternals(node: Node, el?: Element | undefined): ((el: Element) => void) | undefined;
function updateInternals(node: Node, el?: Element | undefined): ((el: Element) => void) | undefined {
    // If you pass an element see if there is an existing internals, if so use that
    if (el && internalsInUse.has(el)) {
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
            render: () => createInternalsRender(internalsForNode, node, el)(),
            set: (key, newValue) => {
                if (internalsForNode.previousContext) {
                    internalsForNode.previousContext[key] = newValue;
                } else {
                    internalsForNode.context[key] = newValue;
                }
            },
            get: (key) => {
                if (internalsForNode.previousContext) return internalsForNode.previousContext[key];
                return internalsForNode.context[key];
            },
        };

        // If we have an element save the internals for it
        if (el) internalsInUse.set(el, internalsForNode);
        internals.current = internalsForNode;

        // Return a callback to set the element for the internals
        return (el) => {
            // Also update the setter to use the new element
            internalsForNode.render = createInternalsRender(internalsForNode, node, el);
            internalsInUse.set(el, internalsForNode);
        };
    }
}

/**
 * This is needed in a couple of places so it's extracted out
 */
const createInternalsRender = (
    internalsForNode: Internals['current'],
    node: Node,
    el: Element | undefined,
): Internals['current']['render'] =>
() => {
    if (!internalsForNode.previousContext) {
        internalsForNode.previousContext = [...internalsForNode.context];
    }
    if (!el) throw new Error('Element not found');
    renderNode(node, el);
};

/**
 * Handle getting the internals
 */
export function getInternals(): Internals['current'] {
    // If we are in the browser return the current internals
    if (typeof document !== 'undefined') {
        return window._internals.current;
    }
    // If we are in the server return simplified internals
    const serverInternals: Internals = {
        current: {
            previousContext: null,
            context: [],
            register: (state) => {
                const key = serverInternals.current.context.length;
                serverInternals.current.context.push(state);
                return key;
            },
            render: () => {
                throw new Error('Calling render is not supported in server');
            },
            set: (key, newValue) => {
                serverInternals.current.context[key] = newValue;
            },
            get: (key) => {
                return serverInternals.current.context[key];
            },
        },
    };
    return serverInternals.current;
}

/**
 * Map of elements to their event listeners
 * TODO: Add some manual cleanup for listeners when the element is removed
 */
const listenersInUse = new WeakMap<Element, [string, EventListenerOrEventListenerObject][]>();

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
 * Can sometimes just be a render but let's call it hydrate
 */
export default function hydrate(component: ComponentType) {
    window._internals = internals;
    const root = document.getElementById('_root');
    if (!root) throw new Error('Root element not found');
    const node = { type: component, attributes: {} };
    const el = renderNode(node, root);
    root.replaceWith(el);
}
