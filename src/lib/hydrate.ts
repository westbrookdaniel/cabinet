import type { ComponentType, HydratedNode, Internals, Node } from '@/lib/types.ts';
import { traverse } from '@/lib/traverse.ts';

function serializeNode(vnode: Node<any>): string {
    if (typeof vnode.type === 'function') {
        return serializeNode(vnode.type(vnode.attributes));
    }

    const children = vnode.attributes.children;
    let childrenStr = '';
    if (children) {
        traverse(children, {
            node: (child) => childrenStr += serializeNode(child),
            string: (child) => childrenStr += child,
        });
    }

    let attributeStr = '';
    Object.entries(vnode.attributes).forEach(([key, value]) => {
        if (value === undefined) return; // Ignore undefined
        if (key === 'children') return; // Ignore children
        if (key.startsWith('on')) return; // Ignore events
        attributeStr += ` ${key}="${value}"`;
    });

    return `<${vnode.type}${attributeStr}>${childrenStr}</${vnode.type}>`;
}

export const internals: Internals = {
    current: {
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

const context = new Map();

function updateInternals(node: HydratedNode<any>) {
    internals.current = {
        register: (initialState) => {
            // TODO: How to tell if it's first render or not?
            console.log('reg', initialState, context.get(node));
            if (context.has(node)) {
                const localContext = context.get(node);
                const key = localContext.length;
                localContext.push(initialState);
                console.log('reg-new', [...localContext]);
                return key;
            } else {
                context.set(node, [initialState]);
                return 0;
            }
        },
        set: (key, newValue) => {
            console.log('set', node.el, newValue, [...context.get(node)]);

            const previousLocalContext = context.get(node);
            previousLocalContext[key] = newValue;

            context.set(node, []);

            const html = serializeNode(node);
            console.log(html);
        },
        get: (key) => {
            return context.get(node)[key];
        },
    };
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
    const currentNode = hydratedNode?.el;

    // If the node is a component, hydrate the component
    if (typeof node.type === 'function') {
        // Update the internals to the current node
        updateInternals(hydratedNode);
        const component = node.type as ComponentType;
        const componentNode = component(node.attributes);
        const hydratedComponent = hydrateNode(componentNode, {
            type: componentNode.type,
            attributes: componentNode.attributes,
            el: currentNode,
            // deno-lint-ignore no-explicit-any
        } as any);
        hydratedNode.attributes.children = hydratedComponent;
        return hydratedNode;
    }

    const hydratedChildren: HydratedNode<keyof HTMLElementTagNameMap>[] = [];
    traverse(node.attributes.children || [], {
        node: (child, i) => {
            // Traverse
            const childNode = i ? currentNode.children[i] : currentNode.children[0];
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
    if (currentNode.nodeName.toLowerCase() !== node.type) {
        console.warn('Hydration failed, nodes dont match', node, currentNode);
        // Break early if the nodes dont match
        return hydratedNode;
    }

    // Apply event listeners
    // Any code that modifies the dom will be run too
    Object.entries(node.attributes).forEach(([key, value]) => {
        if (key.startsWith('on') && typeof value === 'function') {
            currentNode.addEventListener(key.slice(2), value as EventListener);
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
