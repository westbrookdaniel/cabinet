import { ref } from '@/lib/client.ts';

export default function Counter() {
    console.log('COUNTER');
    // TODO: Fix multiple registers in the same component
    const count = ref(0);
    const count2 = ref(0);
    return (
        <div>
            <button onclick={() => count.value--}>-</button>
            <span style='margin-left: 8px; margin-right: 8px;'>Count: {count.value}</span>
            <button onclick={() => count.value++}>+</button>
            <button onclick={() => count2.value--}>-</button>
            <span style='margin-left: 8px; margin-right: 8px;'>Count2: {count2.value}</span>
            <button onclick={() => count2.value++}>+</button>
        </div>
    );
}
