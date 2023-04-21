import { getId } from '@/lib/utils.ts';

function render(id: string, contents: string) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = contents;
}

export default function Counter() {
    const id = getId();

    const count = {
        _value: 0,
        get value() {
            return this._value;
        },
        set value(value) {
            this._value = value;
            // re-render
            render(id, `Count: ${this._value}`);
        },
    };

    return (
        <div>
            <button onclick={() => count.value--}>-</button>
            <span id={id} style='margin-left: 8px; margin-right: 8px;'>Count: {count.value}</span>
            <button style='margin-right: 16px;' onclick={() => count.value++}>+</button>
        </div>
    );
}
