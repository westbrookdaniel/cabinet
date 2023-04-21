import { createBrowserHistory, RouterHistory } from '@/lib/history.ts';
import { renderNode } from '@/lib/render.ts';
import { PageType } from '@/lib/types.ts';

/**
 * Setup client side routing
 */
export function createClientRouter(root: HTMLElement) {
    const history = createBrowserHistory();

    history.listen(async () => {
        const path = history.location.pathname;
        const bundlePath = `/_bundle/pages${path === '/' ? '/index' : path}.js`;
        const page: PageType = (await import(bundlePath)).default;
        renderNode(root, { type: page, attributes: {} });
    });

    // Hijack all links
    document.querySelectorAll('a').forEach((el) => hijackLink(history, el));

    // Watch for changes to the dom and hijack new or changed links
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            switch (mutation.type) {
                case 'childList':
                    mutation.addedNodes.forEach((el) => {
                        if (el instanceof HTMLElement) {
                            if (el instanceof HTMLAnchorElement) hijackLink(history, el);
                            el.querySelectorAll('a').forEach((el) => hijackLink(history, el));
                        }
                    });
                    break;
                case 'attributes': {
                    const el = mutation.target;
                    if (el instanceof HTMLElement) {
                        if (el instanceof HTMLAnchorElement) hijackLink(history, el);
                        el.querySelectorAll('a').forEach((el) => hijackLink(history, el));
                    }
                }
            }
        });
    });

    observer.observe(document, {
        childList: true,
        subtree: true,
        attributes: true,
    });

    return history;
}

/**
 * Map of elements to their event listeners
 * TODO: Add some manual cleanup for listeners when the element is removed?
 */
const existingRouterListeners = new WeakMap<HTMLElement, [string, EventListenerOrEventListenerObject]>();

const hijackLink = (history: RouterHistory, el: HTMLAnchorElement) => {
    // Remove old listener
    // We remove it here in case the target changes, or it changes to an external link
    if (existingRouterListeners.has(el)) {
        const [eventType, listener] = existingRouterListeners.get(el)!;
        el.removeEventListener(eventType, listener);
        // Remove from map
        existingRouterListeners.delete(el);
    }

    // If same origin and internal
    el.addEventListener('click', (e) => {
        e.preventDefault();
        const href = el.getAttribute('href')!;
        if (!el.target && href?.startsWith('/')) {
            history.push(href);
        }
    });
};
