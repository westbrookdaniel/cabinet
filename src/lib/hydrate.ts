import type { ComponentType, HydratedNode, Internals, Node } from '@/lib/types.ts';
import { traverse } from '@/lib/traverse.ts';

/**
 * TODO: This is broken
 * This re-runs a hydrated node
 */
function renderNode(
    node: HydratedNode<any>,
    previousNode = node,
): HydratedNode<any> {
    const currentEl = previousNode?.el;

    // If the node is a component, hydrate the component
    if (typeof node.type === 'function') {
        // Update the internals to the current node
        updateInternals(previousNode);
        // Render the component
        const component = node.type as ComponentType;
        const componentNode = component(node.attributes);
        // TODO: Do we need to be doing node creation? or diffing here?
        // Continue the hydration
        const hydratedComponent = hydrateNode(componentNode, {
            type: componentNode.type,
            attributes: componentNode.attributes,
            el: currentEl,
            // deno-lint-ignore no-explicit-any
        } as any);
        previousNode.attributes.children = hydratedComponent;

        return previousNode;
    }

    const hydratedChildren: HydratedNode<keyof HTMLElementTagNameMap>[] = [];
    traverse(node.attributes.children || [], {
        node: (child, i) => {
            // Traverse
            const childNode = i ? currentEl.children[i] : currentEl.children[0];
            if (!childNode) return;
            // TODO: Do we need to be doing node creation? or diffing here?
            hydratedChildren.push(hydrateNode(child, {
                type: child.type,
                attributes: child.attributes,
                el: childNode,
                // deno-lint-ignore no-explicit-any
            }) as any);
        },
        // Ignore strings
    });
    if (hydratedChildren.length) {
        previousNode.attributes.children = hydratedChildren;
    }

    // Check this is roughly the same node
    if (currentEl.nodeName.toLowerCase() !== node.type) {
        console.warn('Failed to render, not in sync', node, currentEl);
        // Break early if the nodes dont match
        return previousNode;
    }

    // Apply event listeners
    // Any code that modifies the dom will be run too
    Object.entries(node.attributes).forEach(([key, value]) => {
        if (key.startsWith('on') && typeof value === 'function') {
            currentEl.addEventListener(key.slice(2), value as EventListener);
        }
    });

    return previousNode;
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
                console.log(node.el, 'set', key, newValue);
                const newState = internalsForNode.context;
                newState[key] = newValue;
                updateInternals(node, [...newState]);
                const el = renderNode(node).el;
                node.el.replaceWith(el);
            },
            get: (key) => {
                console.log('get', node, internalsForNode, key);
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
 */
function hydrateNode(
    node: Node<any>,
    hydratedNode: HydratedNode<any>,
): HydratedNode<any> {
    const currentEl = hydratedNode?.el;

    // If the node is a component, hydrate the component
    if (typeof node.type === 'function') {
        // Update the internals to the current node
        updateInternals(hydratedNode);
        // Render the component
        const component = node.type as ComponentType;
        const componentNode = component(node.attributes);
        // Continue the hydration
        const hydratedComponent = hydrateNode(componentNode, {
            type: componentNode.type,
            attributes: componentNode.attributes,
            el: currentEl,
            // deno-lint-ignore no-explicit-any
        } as any);
        hydratedNode.attributes.children = hydratedComponent;

        return hydratedNode;
    }

    const hydratedChildren: HydratedNode<keyof HTMLElementTagNameMap>[] = [];
    traverse(node.attributes.children || [], {
        node: (child, i) => {
            // Traverse
            const childNode = i ? currentEl.children[i] : currentEl.children[0];
            if (!childNode) return;
            hydratedChildren.push(hydrateNode(child, {
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
    if (currentEl.nodeName.toLowerCase() !== node.type) {
        console.warn('Hydration failed, nodes dont match', node, currentEl);
        // Break early if the nodes dont match
        return hydratedNode;
    }

    // Apply event listeners
    // Any code that modifies the dom will be run too
    Object.entries(node.attributes).forEach(([key, value]) => {
        if (key.startsWith('on') && typeof value === 'function') {
            currentEl.addEventListener(key.slice(2), value as EventListener);
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
    hydrateNode(component({}), hydrated);
}
