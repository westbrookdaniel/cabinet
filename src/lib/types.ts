import { VNode } from '@/lib/jsx-runtime';

export type ComponentType = <K extends keyof HTMLElementTagNameMap>() => VNode<K>;

export function isComponentType(value: unknown): value is ComponentType {
    return typeof value === 'function';
}
