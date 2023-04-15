import type { Children } from '@/lib/types.ts';

interface Props {
    children: Children;
}

export default function Section({ children }: Props) {
    return <div style='padding: 16px; border: 1px solid gray;'>{children}</div>;
}
