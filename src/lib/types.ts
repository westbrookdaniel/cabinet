export interface PageMeta {
    hydrate?: boolean;
}

export type PageType = ComponentType & { meta?: PageMeta };

export type ComponentType = <K extends keyof HTMLElementTagNameMap>() => VNode<K>;

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

export type VNode<K extends keyof HTMLElementTagNameMap> = {
    nodeName: K;
    attributes: Omit<HTMLElementTagNameMap[K], 'children' | 'style'> & {
        children: (VNode<keyof HTMLElementTagNameMap> | string)[] | string;
        style?: string;
    };
};

declare global {
    interface Window {
        component?: ComponentType;
    }

    namespace JSX {
        type IntrinsicElements = {
            [K in keyof HTMLElementTagNameMap]:
                & Omit<
                    Partial<HTMLElementTagNameMap[K]>,
                    'style'
                >
                & {
                    // TODO: Support based object styles
                    style?: string;
                };
        };
    }
}
