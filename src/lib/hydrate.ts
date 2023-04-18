import type { ComponentType, HydratedNode, Internals, Node } from '@/lib/types.ts';
import { traverse } from '@/lib/traverse.ts';

export function serializeNode(node: Node<keyof HTMLElementTagNameMap>): string {
    if (typeof node.type === 'function') {
        return serializeNode(node.type(node.attributes));
    }

    const children = node.attributes.children;
    let childrenStr = '';
    if (children) {
        traverse(children, {
            node: (child) => childrenStr += serializeNode(child),
            string: (child) => childrenStr += child,
        });
    }

    let attributeStr = '';
    Object.entries(node.attributes).forEach(([key, value]) => {
        if (value === undefined) return; // Ignore undefined
        if (key === 'children') return; // Ignore children
        if (key.startsWith('on')) return; // Ignore events
        attributeStr += ` ${key}="${value}"`;
    });

    return `<${node.type}${attributeStr}>${childrenStr}</${node.type}>`;
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

const internalsInUse = new WeakMap<Element, Internals['current']>();

/**
 * Creates new internals for the current node
 * If there is already an interanal in use for the hydrated
 * node's element it uses that instead
 */
function updateInternals(node: HydratedNode<any>, previousContext: any[] | null = null) {
    console.log(node);
    if (internalsInUse.has(node.el)) {
        const internalsForNode = internalsInUse.get(node.el)!;
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
                updateInternals(node, [...newState]);
                const done = hydrateNode(true, node);
                node.el.replaceWith(done.el);
            },
            get: (key) => {
                if (internalsForNode.previousContext) return internalsForNode.previousContext[key];
                return internalsForNode.context[key];
            },
        };

        internalsInUse.set(node.el, internalsForNode);
        internals.current = internalsForNode;
    }
}

/**
 * Similar structure to createNode but traverses the dom
 * to apply event listeners and hook up the virtual dom to the real dom
 * Will break if the dom is not the same as the virtual dom
 *
 * TODO: Change hydrates args to be:
 * - hydratedNode: The node with existing el
 * - newParentEl?: The new tree being made, once hydrated node has been handled
 *      the new created el needs to be appended to this. It also needs to be moved to hydrateNode
 */
function hydrateNode(
    shouldCreate: boolean,
    hydratedNode: HydratedNode<any>,
): HydratedNode<any> {
    // If the node is a component, hydrate the component
    if (typeof hydratedNode.type === 'function') {
        // Update the internals to the current node
        updateInternals(hydratedNode);
        // Render the component
        const component = hydratedNode.type as ComponentType;
        const componentNode = component(hydratedNode.attributes);

        // Continue the hydration
        const hydratedComponent = hydrateNode(shouldCreate, {
            type: componentNode.type,
            attributes: componentNode.attributes,
            // Don't use currentEl since we never want to create here
            // This is more for unwrapping the component
            el: hydratedNode?.el,
            // deno-lint-ignore no-explicit-any
        } as any);
        hydratedNode.attributes.children = hydratedComponent;

        return hydratedNode;
    }

    if (shouldCreate) hydratedNode.el = document.createElement(hydratedNode.type);
    const currentEl = hydratedNode.el;

    const hydratedChildren: HydratedNode<keyof HTMLElementTagNameMap>[] = [];
    traverse(hydratedNode.attributes.children || [], {
        node: (child, i) => {
            // Traverse
            const childNode = i ? currentEl.children[i] : currentEl.children[0];

            if (!childNode) return;

            hydratedChildren.push(hydrateNode(shouldCreate, {
                type: child.type,
                attributes: child.attributes,
                el: childNode,
                // deno-lint-ignore no-explicit-any
            }) as any);
        },
        // Ignore strings
    });
    if (hydratedChildren.length) {
        hydratedNode.attributes.children = hydratedChildren;
    }

    // Check this is roughly the same node
    if (currentEl.nodeName.toLowerCase() !== hydratedNode.type) {
        console.warn('Hydration failed, nodes dont match', hydratedNode, currentEl);
        // Break early if the nodes dont match
        return hydratedNode;
    }

    // Apply attributes
    // Any code that modifies the dom will be run too
    Object.entries(hydratedNode.attributes).forEach(([key, value]) => {
        if (key === 'children') return;
        if (value === undefined) return;
        if (key.startsWith('on') && typeof value === 'function') {
            return currentEl.addEventListener(key.slice(2), value as EventListener);
        }
        // Don't bother setting if we're not creating
        if (shouldCreate) {
            currentEl.setAttribute(key, value);
        }
    });

    return hydratedNode;
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
 * Hydrates the dom with the virtual dom
 * Basically just kickstarts hydrateNode
 */
export default function hydrate(component: ComponentType) {
    // @ts-ignore
    window._internals = internals;
    const root = document.body.children[0];
    const hydrated = {
        type: component,
        attributes: {},
        el: root,
    };
    updateInternals(hydrated);
    hydrateNode(false, hydrated);
}
