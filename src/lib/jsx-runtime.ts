import type { Node, PageType } from '@/lib/types.ts';

function jsx<K extends keyof HTMLElementTagNameMap>(
    elementType: K | PageType,
    attributes: Node['attributes'],
): Node<K> {
    if (typeof elementType === 'function') {
        return { type: elementType, attributes };
    }
    return { type: elementType, attributes };
}

function Fragment(props: Pick<Node['attributes'], 'children'>) {
    return props.children;
}

export { Fragment, jsx, jsx as jsxs };
