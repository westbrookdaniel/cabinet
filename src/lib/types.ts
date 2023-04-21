import { RouterHistory } from '@/lib/history.ts';

export type NoProps = Record<string, never>;

export type PageType = ComponentType<NoProps>;

export type ComponentType<P = NoProps> = <T extends keyof HTMLElementTagNameMap>(props: P) => Node<T>;

export type ServerModule = {
    get?: (req: Request) => Promise<Response> | Response;
    post?: (req: Request) => Promise<Response> | Response;
};

export interface ModuleMap {
    // Because we * import all modules, we can't use the type of the module
    // deno-lint-ignore no-explicit-any
    [key: string]: any; // PageType | ServerModule;
}

// Node can also be string? or null maybe?
// deno-lint-ignore no-explicit-any
export type Node<T extends keyof HTMLElementTagNameMap = any> = {
    type: T | ComponentType;
    attributes: Omit<HTMLElementTagNameMap[T], 'children' | 'style'> & {
        children?: Child[] | Child;
        style?: string;
    };
};

export type Child =
    | Node
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

        // deno-lint-ignore no-explicit-any
        export type Element = Node<any>;

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

    interface Window {
        router: RouterHistory;
    }
}
