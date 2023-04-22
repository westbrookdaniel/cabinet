import { renderNode } from '@/lib/render.ts';
import { createClientRouter } from '@/lib/router.ts';
import type { PageType } from '@/lib/types.ts';
import { setMeta } from './utils.tsx';

/**
 * Hydrates the dom elements with our component
 * Pretty much just a render but lets call it hydrate
 */
export default function hydrate(component: PageType) {
    const root = document.getElementById('_root');
    if (!root) throw new Error('Root element not found');
    window.router = createClientRouter(root);
    renderNode(root, { type: component, attributes: {} });
    // This should already have been done during hydration
    // Be we'll do it again just in case
    if (component.meta) setMeta.from(component.meta);
}
