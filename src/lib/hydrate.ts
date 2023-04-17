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
    registry: [],
    register: () => {
        throw new Error('Register function not set');
    },
    render: (key, newState) => {
        // Get the root
        const root = internals.registry[key];
        if (!root) throw new Error('Root not found');

        // Update the value
        internals.registry[key] = { node: root.node, state: newState };

        // Update the dom
        const s = serializeNode(root.node);
        console.log(s);
        root.node.el.innerHTML = s;
    },
};

function updateRegister(node: HydratedNode<any>) {
    // TODO: do i pop here? how does react manage their context stack?
    // this is pretty broken
    internals.register = (state) => {
        const key = internals.registry.length; // Index of item to be added
        internals.registry.push({ node, state });
        return { key, state };
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
        updateRegister(hydratedNode);
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
    traverse(node.attributes.children, {
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
export function getInternals(): Internals {
    if (typeof document !== 'undefined') {
        // @ts-ignore
        return window._internals;
    }
    // Fake some internals for the server
    return {
        registry: [],
        register: (state) => {
            const key = internals.registry.length; // Index of item to be added
            internals.registry.push({ node: null as any, state });
            return { key, state };
        },
        render: () => {
            throw new Error('Rendering is not supported in the server');
        },
    };
}

/**
 * Hydrates the dom with the virtual dom
 * Basically just kickstarts hydrateNode
 */
export default function hydrate(component: ComponentType) {
    // @ts-ignore
    window._internals = internals;
    const el = document.body.children[0];
    const node: Node<any> = {
        type: component,
        attributes: {} as any,
    };
    const hydratedNode: HydratedNode<any> = {
        type: node.type,
        attributes: node.attributes,
        el,
    };
    updateRegister(hydratedNode);
    hydrateNode(node, hydratedNode);
}
