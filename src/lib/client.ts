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
