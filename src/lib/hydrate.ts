import type { Node } from '@/lib/types.ts';

/**
 * Similar structure to createNode but just traverses the dom and applies event listeners
 */
function hydrateNode(
    root: HTMLElement,
    vnode: Node<keyof HTMLElementTagNameMap>,
    currentNode: Element,
) {
    const children = vnode.attributes.children;
    if (typeof children === 'string') {
        // Ignore
    } else if (Array.isArray(children)) {
        children.forEach((child, i) => {
            if (typeof child === 'string') {
                // Ignore
            } else {
                // Traverse
                const childNode = currentNode.children[i];
                if (!childNode) {
                    console.warn('Hydration failed, no child node found at index', i, 'of', currentNode);
                    return; // Break but don't throw
                }
                hydrateNode(root, child, childNode);
            }
        });
    } else {
        if (typeof children === 'string') {
            // Ignore
        } else {
            // Traverse
            const childNode = currentNode.children[0];
            if (!childNode) {
                console.warn('Hydration failed, no child node for', currentNode);
                return; // Break but don't throw
            }
            hydrateNode(root, children, childNode);
        }
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

if (typeof document !== 'undefined') {
    const component = window.component;
    if (typeof component === 'function') {
        hydrateNode(document.body, component({}), document.body.children[0]);
    }
}
