export function traverse<N>(
    children: string | N | (N | string)[],
    handlers: {
        node?: (child: N, i?: number) => void;
        string?: (child: string, i?: number) => void;
    },
) {
    if (typeof children === 'string') {
        handlers.string?.(children);
    } else if (Array.isArray(children)) {
        children.flat().forEach((child, i) => {
            if (typeof child === 'object') {
                handlers.node?.(child as any, i);
            } else {
                handlers.string?.(child as any, i);
            }
        });
    } else {
        handlers.node?.(children);
    }
}
