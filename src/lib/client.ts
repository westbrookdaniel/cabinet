import { getInternals } from '@/lib/hydrate.ts';

export function ref<T>(initial: T) {
    const internals = getInternals();

    const listeners: ((value: T) => void)[] = [];

    const v = {
        get value() {
            return state;
        },
        set value(newValue) {
            internals.render(key, newValue);
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

    // TODO: idk if this is quite right?
    const { key, state } = internals.register(initial);

    return v;
}
