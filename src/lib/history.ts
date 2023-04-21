// Pretty similar to the history npm package and TanStack Router

export interface RouterHistory {
    location: RouterLocation;
    listen: (cb: () => void) => () => void;
    // deno-lint-ignore no-explicit-any
    push: (path: string, state: any) => void;
    // deno-lint-ignore no-explicit-any
    replace: (path: string, state: any) => void;
    go: (index: number) => void;
    back: () => void;
    forward: () => void;
    createHref: (href: string) => string;
    block: (blockerFn: BlockerFn) => () => void;
}

export interface RouterLocation {
    href: string;
    pathname: string;
    search: string;
    hash: string;
    // deno-lint-ignore no-explicit-any
    state: any;
}

type BlockerFn = (retry: () => void, cancel: () => void) => void;

const popStateEvent = 'popstate';
const beforeUnloadEvent = 'beforeunload';

const beforeUnloadListener = (event: Event) => {
    event.preventDefault();
    // deno-lint-ignore ban-ts-comment
    // @ts-ignore
    return (event.returnValue = '');
};

const stopBlocking = () => {
    removeEventListener(beforeUnloadEvent, beforeUnloadListener, {
        capture: true,
    });
};

function createHistory(opts: {
    getLocation: () => RouterLocation;
    listener: (onUpdate: () => void) => () => void;
    pushState: (path: string, state: any) => void;
    replaceState: (path: string, state: any) => void;
    go: (n: number) => void;
    back: () => void;
    forward: () => void;
    createHref: (path: string) => string;
}): RouterHistory {
    let currentLocation = opts.getLocation();
    let unsub = () => {};
    // deno-lint-ignore prefer-const
    let listeners = new Set<() => void>();
    let blockers: BlockerFn[] = [];
    // deno-lint-ignore prefer-const
    let queue: (() => void)[] = [];

    const tryFlush = () => {
        if (blockers.length) {
            blockers[0]?.(tryFlush, () => {
                blockers = [];
                stopBlocking();
            });
            return;
        }

        while (queue.length) {
            queue.shift()?.();
        }

        onUpdate();
    };

    const queueTask = (task: () => void) => {
        queue.push(task);
        tryFlush();
    };

    const onUpdate = () => {
        currentLocation = opts.getLocation();
        listeners.forEach((listener) => listener());
    };

    return {
        get location() {
            return currentLocation;
        },
        listen: (cb: () => void) => {
            if (listeners.size === 0) {
                unsub = opts.listener(onUpdate);
            }
            listeners.add(cb);

            return () => {
                listeners.delete(cb);
                if (listeners.size === 0) {
                    unsub();
                }
            };
        },
        // deno-lint-ignore no-explicit-any
        push: (path: string, state: any) => {
            queueTask(() => {
                opts.pushState(path, state);
            });
        },
        // deno-lint-ignore no-explicit-any
        replace: (path: string, state: any) => {
            queueTask(() => {
                opts.replaceState(path, state);
            });
        },
        go: (index) => {
            queueTask(() => {
                opts.go(index);
            });
        },
        back: () => {
            queueTask(() => {
                opts.back();
            });
        },
        forward: () => {
            queueTask(() => {
                opts.forward();
            });
        },
        createHref: (str) => opts.createHref(str),
        block: (cb) => {
            blockers.push(cb);

            if (blockers.length === 1) {
                addEventListener(beforeUnloadEvent, beforeUnloadListener, {
                    capture: true,
                });
            }

            return () => {
                blockers = blockers.filter((b) => b !== cb);

                if (!blockers.length) {
                    stopBlocking();
                }
            };
        },
    };
}

export function createBrowserHistory(): RouterHistory {
    const getHref = () => `${window.location.pathname}${window.location.hash}${window.location.search}`;
    const createHref = (path: string) => path;
    const getLocation = () => parseLocation(getHref(), history.state);

    return createHistory({
        getLocation,
        listener: (onUpdate) => {
            addEventListener(popStateEvent, onUpdate);
            return () => {
                removeEventListener(popStateEvent, onUpdate);
            };
        },
        pushState: (path, state) => {
            window.history.pushState(
                { ...state, key: getKey() },
                '',
                createHref(path),
            );
        },
        replaceState: (path, state) => {
            window.history.replaceState(
                { ...state, key: getKey() },
                '',
                createHref(path),
            );
        },
        back: () => window.history.back(),
        forward: () => window.history.forward(),
        go: (n) => window.history.go(n),
        createHref: (path) => createHref(path),
    });
}

// deno-lint-ignore no-explicit-any
function parseLocation(href: string, state: any): RouterLocation {
    const hashIndex = href.indexOf('#');
    const searchIndex = href.indexOf('?');

    return {
        href,
        pathname: href.substring(
            0,
            hashIndex > 0
                ? searchIndex > 0 ? Math.min(hashIndex, searchIndex) : hashIndex
                : searchIndex > 0
                ? searchIndex
                : href.length,
        ),
        hash: hashIndex > -1 ? href.substring(hashIndex, searchIndex) : '',
        search: searchIndex > -1 ? href.substring(searchIndex) : '',
        state,
    };
}

function getKey() {
    // Using same implementation as getId
    return Math.random().toString(36);
}
