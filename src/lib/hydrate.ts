import type { ComponentType, Node } from '@/lib/types.ts';
import { traverse } from './tranverse.ts';

/**
 * Similar structure to createNode but just traverses the dom and applies event listeners
 */
function hydrateNode(
    vnode: Node<keyof HTMLElementTagNameMap>,
    currentNode: Element,
) {
    traverse(vnode.attributes.children, {
        node: (child, i) => {
            // Traverse
            const childNode = i ? currentNode.children[i] : currentNode.children[0];
            if (!childNode) return;
            hydrateNode(child, childNode);
        },
        string: () => {
            // Ignore
        },
    });

    // Check this is roughly the same node
    if (currentNode.nodeName.toLowerCase() !== vnode.nodeName) {
        console.warn('Hydration failed, nodes dont match', vnode, currentNode);
        return; // Break but don't throw
    }

    // Apply event listeners
    // Any code that modifies the dom will be run too
    Object.entries(vnode.attributes).forEach(([key, value]) => {
        if (key === 'children') return;
        if (key.startsWith('on') && typeof value === 'function') {
            currentNode.addEventListener(key.slice(2), value as EventListener);
            return;
        }
    });
}

export default function hydrate(component: ComponentType) {
    hydrateNode(component({}), document.body.children[0]);
}
