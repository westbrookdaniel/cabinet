import { getInternals } from '@/lib/hydrate.ts';

export type Ref<T> = {
    value: T;
    subscribe(listener: (value: T) => void): () => void;
};

export function ref<T>(initial: T) {
    const internals = getInternals();
    const key = internals.register(initial);

    const listeners: ((value: T) => void)[] = [];

    const v: Ref<T> = {
        get value() {
            return internals.get<T>(key);
        },
        set value(newValue) {
            internals.set(key, newValue);
            internals.render();
            listeners.forEach((listener) => listener(newValue));
        },
        subscribe(listener: (value: T) => void) {
            listeners.push(listener);
            return () => {
                const index = listeners.indexOf(listener);
                if (index > -1) listeners.splice(index, 1);
            };
        },
    };

    return v;
}

// deno-lint-ignore no-explicit-any
export type MemoType<T> = { deps: any[]; value: T } | null;

// deno-lint-ignore no-explicit-any
export function memo<T>(deps: any[], fn: () => T): T {
    const internals = getInternals();
    const key = internals.register(null);
    const state = internals.get<MemoType<T>>(key);
    if (state && state.deps.every((dep, i) => dep === deps[i])) {
        return state.value;
    }
    const value = fn();
    internals.set(key, { deps, value });
    return value;
}
