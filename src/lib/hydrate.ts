import type { HTMLDocument } from 'deno-dom';
import { createNode } from '@/lib/createNode.ts';

if (typeof document !== 'undefined') {
    const component = window.component;
    if (typeof component === 'function') {
        const el: any = createNode(document as unknown as HTMLDocument, component({}));
        document.body.replaceChildren(el);
    }
}
