import type { ComponentType, Internals, Node } from '@/lib/types.ts';
import { traverse } from '@/lib/traverse.ts';

/**
 * Creates dom element from a node
 */
function renderNode(node: Node, previousParentEl: Element): Element {
    if (typeof node.type === 'function') {
        /**
         * Currently this is being passed the previousParentEl which allows us to get the context of the previous render
         * Issue is that we don't pass it the new element so the next render everything breaks
         *
         * Perhaps we should try and update the child elements instead of replacing them
         * That way we can keep the context and possibly improve performance
         */
        updateInternals(node, previousParentEl);
        return renderNode(node.type(node.attributes), previousParentEl);
    }

    const el = document.createElement(node.type);
    applyAttributes(node, el);

    const children = node.attributes.children;
    if (children) {
        traverse(children, {
            node: (child, i) => el.appendChild(renderNode(child, previousParentEl.children[i ?? 0])),
            string: (child) => el.appendChild(document.createTextNode(child)),
        });
    }

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

const internalsInUse = new Map<Element, Internals['current']>();

/**
 * Creates new internals for the current node
 * If there is already an interanal in use for the hydrated
 * node's element it uses that instead
 */
function updateInternals(node: Node, el: Element, previousContext: any[] | null = null) {
    if (internalsInUse.has(el)) {
        const internalsForNode = internalsInUse.get(el)!;
        internalsForNode.previousContext = previousContext;
        internalsForNode.context = [];
        internals.current = internalsForNode;
    } else {
        const internalsForNode: Internals['current'] = {
            previousContext,
            context: [],
            register: (initialState) => {
                const localContext = internalsForNode.context;
                const key = localContext.length;
                localContext.push(initialState);
                return key;
            },
            set: (key, newValue) => {
                const newState = internalsForNode.context;
                newState[key] = newValue;
                updateInternals(node, el, [...newState]);
                const newEl = renderNode(node, el);
                el.replaceChildren(newEl);
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
 * Applies attributes of a node to a dom element
 */
function applyAttributes(node: Node, el: Element) {
    // Apply attributes
    // Any code that modifies the dom will be run too
    Object.entries(node.attributes).forEach(([key, value]) => {
        if (key === 'children') return;
        if (value === undefined) return;
        if (key.startsWith('on') && typeof value === 'function') {
            return el.addEventListener(key.slice(2), value as EventListener);
        }
        el.setAttribute(key, value);
    });
}

/**
 * Hydrates the dom with the virtual dom
 * Basically just kickstarts hydrateNode
 */
export default function hydrate(component: ComponentType) {
    // @ts-ignore
    window._internals = internals;
    const root = document.body.children[0];
    const node = { type: component, attributes: {} };
    updateInternals(node, root);
    const el = renderNode(node, root);
    root.replaceWith(el);
}
