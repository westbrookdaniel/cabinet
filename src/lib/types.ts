export interface PageMeta {
    hydrate?: boolean;
}

export type PageType = ComponentType & { meta?: PageMeta };

// deno-lint-ignore no-explicit-any
export type ComponentType<P = any> = <T extends keyof HTMLElementTagNameMap>(props: P) => Node<T>;

export interface ModuleMap {
    [key: string]: PageType;
}

export interface PageDataMap {
    [key: string]: PageData;
}

export interface PageData {
    component: ComponentType;
    file: string;
    meta?: PageMeta;
}

export type Children = any; // TODO: How to type all this properly?

// Node can also be string? or null maybe?
// deno-lint-ignore no-explicit-any
export type Node<T extends keyof HTMLElementTagNameMap = any> = {
    nodeName: T;
    attributes: Omit<HTMLElementTagNameMap[T], 'children' | 'style'> & {
        children: Node[] | Node | string;
        style?: string;
    };
};

export type ElementProps<T extends keyof HTMLElementTagNameMap> =
    & Omit<
        Partial<HTMLElementTagNameMap[T]>,
        'style'
    >
    & {
        // TODO: Support based object styles
        style?: string;
    };

declare global {
    interface Window {
        component?: ComponentType;
    }

    namespace JSX {
        type IntrinsicElements = {
            [T in keyof HTMLElementTagNameMap]: ElementProps<T>;
        };
    }
}
