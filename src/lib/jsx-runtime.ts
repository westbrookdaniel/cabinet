import type { ComponentType, Node } from '@/lib/types.ts';

function jsx<K extends keyof HTMLElementTagNameMap>(
    elementType: K | ComponentType,
    // TODO: fix this
    // deno-lint-ignore no-explicit-any
    attributes: any, // children is Node
): Node<K> {
    if (typeof elementType === 'function') {
        return elementType(attributes);
    }
    return { nodeName: elementType, attributes };
}

// deno-lint-ignore no-explicit-any
function Fragment(props: any) {
    return props.children;
}

export { Fragment, jsx, jsx as jsxs };
