import { memo, ref } from '@/lib/client.ts';

export default function Counter() {
    const count1 = ref(0);
    const count2 = ref(0);

    // Log count1 value when count2 changes
    memo([count2.value], () => console.log('count1:', count1.value));

    return (
        <div>
            <button onclick={() => count1.value--}>-</button>
            <span style='margin-left: 8px; margin-right: 8px;'>Count1: {count1.value}</span>
            <button style='margin-right: 16px;' onclick={() => count1.value++}>+</button>
            <button onclick={() => count2.value--}>-</button>
            <span style='margin-left: 8px; margin-right: 8px;'>Count2: {count2.value}</span>
            <button onclick={() => count2.value++}>+</button>
        </div>
    );
}
