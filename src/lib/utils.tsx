import { renderNode } from '@/lib/render.ts';
import type { BasicMeta, Node } from '@/lib/types.ts';

export const getId = () => Math.random().toString(36);

export const withFormData = <T,>(cb: (data: T, target: HTMLFormElement) => void) => (e: SubmitEvent) => {
    e.preventDefault();
    const el = e.target as HTMLFormElement;
    const formData = new FormData(el);
    const data = Object.fromEntries(formData.entries()) as T;
    cb(data, el);
};

// deno-lint-ignore no-explicit-any
export function postJson(json: Record<any, any>): RequestInit {
    return {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(json),
    };
}

export function setMeta(meta: Node[]) {
    const head = document.querySelector('head');
    if (!head) return;
    meta.forEach((node) => {
        const el = renderNode(null, node);
        const existing = el.nodeName === 'TITLE'
            ? head.querySelector('title')
            : head.querySelector(`meta[name="${el.getAttribute('name')}"]`);
        if (existing) {
            existing.replaceWith(el);
        } else {
            head.appendChild(el);
        }
    });
}

setMeta.from = (meta: BasicMeta) => {
    const tags = [];
    if (meta.title) {
        tags.push(<title>{meta.title}</title>);
    }
    if (meta.description) {
        tags.push(<meta name='description' content={meta.description} />);
    }
    if (meta.image) {
        tags.push(<meta name='image' content={meta.image} />);
    }
    return setMeta(tags);
};
