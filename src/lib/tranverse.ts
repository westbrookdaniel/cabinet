import type { Node } from '@/lib/types.ts';

export function traverse(
    // deno-lint-ignore no-explicit-any
    children: string | Node<any> | (Node<any> | string)[],
    handlers: {
        // deno-lint-ignore no-explicit-any
        node: (child: Node<any>, i?: number) => void;
        string: (child: string, i?: number) => void;
    },
) {
    if (typeof children === 'string') {
        handlers.string(children);
    } else if (Array.isArray(children)) {
        children.flat().forEach((child, i) => {
            if (typeof child === 'string') {
                handlers.string(child, i);
            } else {
                handlers.node(child, i);
            }
        });
    } else {
        handlers.node(children);
    }
}
