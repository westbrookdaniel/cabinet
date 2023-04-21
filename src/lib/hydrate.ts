import { renderNode } from '@/lib/render.ts';
import { createClientRouter } from '@/lib/router.ts';
import type { ComponentType } from '@/lib/types.ts';

/**
 * Hydrates the dom elements with our component
 * Pretty much just a render but lets call it hydrate
 */
export default function hydrate(component: ComponentType) {
    const root = document.getElementById('_root');
    if (!root) throw new Error('Root element not found');
    renderNode(root, { type: component, attributes: {} });
    window.router = createClientRouter(root);
}
