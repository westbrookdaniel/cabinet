import type { ComponentType, Node } from '@/lib/types.ts';
import { traverse } from '@/lib/traverse.ts';
import { createBrowserHistory, RouterHistory } from './history.ts';

/**
 * Creates dom element from a node
 */
export function renderNode(
    previousEl: HTMLElement | undefined,
    node: Node,
): HTMLElement {
    // If it's a component call it's render function
    if (typeof node.type === 'function') {
        return renderNode(previousEl, node.type(node.attributes));
    }

    // TODO: Add optimisation around reusing dom elements
    const el: HTMLElement = document.createElement(node.type);
    previousEl?.replaceChildren(el);

    applyAttributes(node, el);

    const children = node.attributes.children;
    const newChildren: (HTMLElement | Text)[] = [];
    if (children) {
        traverse(children, {
            node: (child, i) => {
                newChildren.push(renderNode(previousEl?.children[i ?? 0] as HTMLElement, child));
            },
            string: (child) => {
                newChildren.push(document.createTextNode(child));
            },
        });
    }
    el.replaceChildren(...newChildren);

    return el;
}

/**
 * Map of elements to their event listeners
 * TODO: Add some manual cleanup for listeners when the element is removed?
 */
const listenersInUse = new WeakMap<HTMLElement, [string, EventListenerOrEventListenerObject][]>();

/**
 * Applies attributes of a node to a dom element
 */
function applyAttributes(node: Node, el: HTMLElement) {
    // Remove old listeners
    if (listenersInUse.has(el)) {
        const oldListeners = listenersInUse.get(el)!;
        oldListeners.forEach(([eventType, listener]) => {
            el.removeEventListener(eventType, listener);
        });
        // Remove from listeners in use
        listenersInUse.delete(el);
    }

    // Apply attributes
    // Any code that modifies the dom will be run too
    Object.entries(node.attributes).forEach(([key, value]) => {
        if (key === 'children') return;
        if (value === undefined) return;
        if (key.startsWith('on') && typeof value === 'function') {
            const eventType = key.slice(2);
            el.addEventListener(eventType, value as EventListener);

            // Add to listeners in use for cleanup next time
            if (!listenersInUse.has(el)) {
                listenersInUse.set(el, [[eventType, value]]);
            } else {
                listenersInUse.get(el)!.push([eventType, value]);
            }
            return;
        }
        el.setAttribute(key, value);
    });
}

/**
 * Hydrates the dom elements with our component
 * Pretty much just a render but lets call it hydrate
 */
export default function hydrate(component: ComponentType) {
    const root = document.getElementById('_root');
    if (!root) throw new Error('Root element not found');
    renderNode(root, { type: component, attributes: {} });
    // TODO: Not quite working yet
    // window.router = createClientRouter(root);
}

interface Router {
    history: RouterHistory;
    // deno-lint-ignore no-explicit-any
    navigate: (path: string, state?: any) => void;
}

/**
 * Setup client side routing
 */
function createClientRouter(root: HTMLElement) {
    const history = createBrowserHistory();
    const router: Router = {
        history,
        navigate: (path, state) => {
            history.push(path, state);

            // TODO: Rework how this all works
            // Get path to bundle
            const bundlePath = `./bundle/pages${path === '/' ? '/index' : path}.js`;
            // remove current script tag and replace with new one
            const existingScript = document.getElementById('_page');
            if (!existingScript) throw new Error('Page script not found');
            const script = document.createElement('script');
            script.id = '_page';
            script.type = 'module';
            script.appendChild(
                document.createTextNode(
                    `import h from './bundle/lib/render.js';import p from '${bundlePath}';h(p);`,
                ),
            );
            existingScript.replaceWith(script);
        },
    };

    // Hijack all links
    root.querySelectorAll('a').forEach((el) => hijackLink(router, el));

    // Watch for changes to the dom and hijack new or changed links
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            switch (mutation.type) {
                case 'childList':
                    mutation.addedNodes.forEach((node) => {
                        if (node instanceof HTMLAnchorElement) {
                            hijackLink(router, node);
                        }
                    });
                    break;
                case 'attributes': {
                    const el = mutation.target;
                    if (el instanceof HTMLAnchorElement) {
                        hijackLink(router, el);
                    }
                }
            }
        });
    });

    observer.observe(root, {
        childList: true,
        subtree: true,
        attributes: true,
    });

    return router;
}

/**
 * Map of elements to their event listeners
 * TODO: Add some manual cleanup for listeners when the element is removed?
 */
const existingRouterListeners = new WeakMap<HTMLElement, [string, EventListenerOrEventListenerObject]>();

const hijackLink = (router: Router, el: HTMLAnchorElement) => {
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
            router.navigate(href);
        }
    });
};
