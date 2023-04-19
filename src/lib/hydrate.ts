import type { ComponentType, Internals, Node } from '@/lib/types.ts';
import { traverse } from '@/lib/traverse.ts';

/**
 * Creates dom element from a node
 */
function renderNode(node: Node, previousEl: Element): Element {
    if (typeof node.type === 'function') {
        /**
         * Currently this is being passed the previousParentEl which allows us to get the context of the previous render
         * Issue is that we don't pass it the new element so the next render everything breaks
         *
         * To combat this we try and update the child elements instead of replacing them
         * That way we can keep the context and possibly improve performance
         *
         * Not sure if that keeping the context is working
         */
        updateInternals(node, previousEl);
        return renderNode(node.type(node.attributes), previousEl);
    }

    // If the same type just replace the attributes
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

const internalsInUse = new Map<Element, Internals['current']>();

/**
 * Creates new internals for the current node
 * If there is already an interanal in use for the hydrated
 * node's element it uses that instead
 */
function updateInternals(node: Node, el: Element) {
    if (internalsInUse.has(el)) {
        const internalsForNode = internalsInUse.get(el)!;
        console.log(
            'gi',
            node,
            [...internalsForNode.previousContext || []],
            [...internalsForNode.context],
            el,
        );
        internalsForNode.previousContext = [...internalsForNode.context];
        internalsForNode.context = [];
        internals.current = internalsForNode;
    } else {
        console.log('gi', node, 'new!', el);
        const internalsForNode: Internals['current'] = {
            previousContext: null,
            context: [],
            register: (initialState) => {
                console.log('register', [...internalsForNode.previousContext || []], node, el, initialState);
                const localContext = internalsForNode.context;
                const key = localContext.length;
                localContext.push(initialState);
                return key;
            },
            set: (key, newValue) => {
                console.log('set', key, newValue, node, el);
                internalsForNode.context[key] = newValue;
                renderNode(node, el);
            },
            get: (key) => {
                console.log(
                    'get',
                    key,
                    [...internalsForNode.previousContext || []],
                    internalsForNode.context,
                    node,
                    el,
                );
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
