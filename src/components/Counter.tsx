import { ref } from '@/lib/client.ts';

export default function Counter() {
    console.log('COUNTER RENDER START');
    const count = ref(0);
    return (
        <div>
            <button onclick={() => count.value--}>-</button>
            <span style='margin-left: 8px; margin-right: 8px;'>Count: {count.value}</span>
            <button onclick={() => count.value++}>+</button>
        </div>
    );
}
