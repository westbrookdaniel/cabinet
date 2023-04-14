import { createNode, isComponentType } from '@/lib/jsx-runtime';
import type { HTMLDocument } from 'deno-dom';

if (typeof document !== 'undefined') {
    const component = window.component;
    if (isComponentType(component)) {
        const el = createNode(document as unknown as HTMLDocument, component());
        document.body.innerHTML = '';
        document.body.appendChild(el as unknown as Element);
    }
}
