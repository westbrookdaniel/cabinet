import type { HTMLDocument } from 'deno-dom';
import { createNode } from '@/lib/createNode.ts';

if (typeof document !== 'undefined') {
    const component = window.component;
    if (typeof component === 'function') {
        const el = createNode(document as unknown as HTMLDocument, component({}));
        document.body.innerHTML = '';
        document.body.appendChild(el as unknown as Element);
    }
}
