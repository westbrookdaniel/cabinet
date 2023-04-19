import type { Node } from '@/lib/types.ts';

export function traverse<N>(
    children: string | N | (N | string)[],
    handlers: {
        node?: (child: Node, i?: number) => void;
        // TODO: Type should be Child but not Node
        // deno-lint-ignore no-explicit-any
        string?: (child: any, i?: number) => void;
        // TODO: Create handlers for all the other children types?
    },
) {
    if (typeof children === 'string') {
        handlers.string?.(children);
    } else if (Array.isArray(children)) {
        children.flat().forEach((child, i) => {
            // TODO: Improve checking for if it's a node
            if (typeof child === 'object') {
                // deno-lint-ignore no-explicit-any
                handlers.node?.(child as any, i);
            } else {
                // deno-lint-ignore no-explicit-any
                handlers.string?.(child as any, i);
            }
        });
    } else {
        // deno-lint-ignore no-explicit-any
        handlers.node?.(children as any);
    }
}
