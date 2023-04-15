import type { Children } from '@/lib/types.ts';

// TODO: How to type?
export default function Section({ children }: any) {
    return <div style='padding: 16px; border: 1px solid gray;'>{children}</div>;
}
