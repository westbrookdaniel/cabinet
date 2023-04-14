declare global {
    namespace JSX {
        type IntrinsicElements = {
            [K in keyof HTMLElementTagNameMap]:
                & Omit<
                    Partial<HTMLElementTagNameMap[K]>,
                    'style'
                >
                & {
                    style?: string;
                };
        };
    }
}

export type VNode<K extends keyof HTMLElementTagNameMap> = {
    nodeName: K;
    attributes: Omit<HTMLElementTagNameMap[K], 'children' | 'style'> & {
        children: (VNode<keyof HTMLElementTagNameMap> | string)[] | string;
        style?: string;
    };
};

export function jsx<K extends keyof HTMLElementTagNameMap>(
    nodeName: K,
    attributes: any, // children is string
): VNode<K> {
    return { nodeName, attributes };
}

export function jsxs<K extends keyof HTMLElementTagNameMap>(
    nodeName: K,
    attributes: any, // children is VNode[]
): VNode<K> {
    return { nodeName, attributes };
}
