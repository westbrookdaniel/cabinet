export interface PageMeta {
    hydrate?: boolean;
}

export type PageType = ComponentType & { meta?: PageMeta };

// deno-lint-ignore no-explicit-any
export type ComponentType<P = any> = <T extends keyof HTMLElementTagNameMap>(props: P) => Node<T>;

export interface ModuleMap {
    [key: string]: PageType;
}

// Node can also be string? or null maybe?
export type Node<T extends keyof HTMLElementTagNameMap> = {
    nodeName: T;
    attributes: Omit<HTMLElementTagNameMap[T], 'children' | 'style'> & {
        // deno-lint-ignore no-explicit-any
        children: Node<any>[] | Node<any> | string;
        style?: string;
    };
};

export type Child =
    // deno-lint-ignore no-explicit-any
    | Node<any>
    // deno-lint-ignore ban-types
    | object
    | string
    | number
    | bigint
    | boolean
    | null
    | undefined;

export type Children = Child | Child[];

export type ElementProps<T extends keyof HTMLElementTagNameMap> =
    & Omit<
        Partial<HTMLElementTagNameMap[T]>,
        'style' | 'children'
    >
    & {
        // TODO: Support based object styles
        style?: string;
        children?: Children;
    };

declare global {
    namespace JSX {
        type IntrinsicElements = {
            [T in keyof HTMLElementTagNameMap]: ElementProps<T>;
        };

        // deno-lint-ignore no-empty-interface no-explicit-any
        export interface Element extends Node<any> {}

        // deno-lint-ignore no-explicit-any
        export type ElementType<P = any> =
            | {
                [K in keyof IntrinsicElements]: P extends IntrinsicElements[K] ? K
                    : never;
            }[keyof IntrinsicElements]
            | ComponentType<P>;

        interface ElementChildrenAttribute {
            // deno-lint-ignore no-explicit-any
            children: any;
        }

        export interface ElementAttributesProperty {
            // deno-lint-ignore no-explicit-any
            props: any;
        }
    }
}
