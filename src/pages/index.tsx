import TodoItem from '@/components/TodoItem.tsx';
import { ref } from '@/lib/client.ts';
import Counter from '@/components/Counter.tsx';

export type Todo = {
    id: number;
    text: string;
    done: boolean;
};

function Home() {
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
            <pre style='margin-top: 10px'>
                {JSON.stringify(todos.value, undefined, 2)}
            </pre>
            <Counter />
        </div>
    );
}

export default Home;
