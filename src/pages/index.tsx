import TodoItem from '@/components/TodoItem.tsx';
import { ref } from '@/lib/client.ts';
import Counter from '@/components/Counter.tsx';
import type { PageType } from '@/lib/types.ts';

export type Todo = {
    id: number;
    text: string;
    done: boolean;
};

const Home: PageType = () => {
    const todos = ref([
        { id: 1, text: 'Handle bundling', done: true },
        { id: 2, text: 'Make reactive', done: false },
        { id: 3, text: 'Improve performance', done: false },
    ]);

    function onToggle(id: number) {
        todos.value = todos.value.map((t) => {
            return t.id === id ? { ...t, done: !t.done } : t;
        });
    }

    return (
        <div>
            {todos.value.map((todo) => (
                <TodoItem
                    todo={todo}
                    onToggle={() => onToggle(todo.id)}
                />
            ))}
            <pre style='margin-top: 10px;'>
                {JSON.stringify(todos.value, undefined, 2)}
            </pre>
            <div style='margin-top: 10px;'>
                <Counter />
            </div>
            <div style='margin-top: 10px;'>
                <Counter />
            </div>
        </div>
    );
};

export default Home;
