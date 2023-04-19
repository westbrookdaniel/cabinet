import { getInternals } from '@/lib/hydrate.ts';

export function ref<T>(initial: T) {
    const internals = getInternals();
    const key = internals.register(initial);

    const listeners: ((value: T) => void)[] = [];

    const v = {
        get value() {
            return internals.get<T>(key);
        },
        set value(newValue) {
            internals.set(key, newValue);
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

export function memo<T>(fn: () => T) {
    const internals = getInternals();
    // TODO: How does memoisation work?
    // Pretty sure we need to pass it in as internals.register(fn)
    // and then maybe only call it when inserting into previousContext?
    // Also might need a deps array? to invalidate by re-setting
    const key = internals.register(fn());
    return internals.get<T>(key);
}
