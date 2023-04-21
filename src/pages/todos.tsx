import type { PageType } from '@/lib/types.ts';
import { Ref, ref } from '@/lib/client.ts';

type Todo = {
    id: number;
    text: string;
    done: boolean;
};

const Todos: PageType = () => {
    const nextId = ref(4);
    const todos = ref<Todo[]>([
        { id: 1, text: 'Handle bundling', done: true },
        { id: 2, text: 'Make reactive', done: true },
        { id: 3, text: 'Improve performance', done: false },
    ]);

    return (
        <div>
            <h1>Todos</h1>
            <AddTodo
                onAdd={(text) => {
                    todos.value = [{ id: nextId.value, text, done: false }, ...todos.value];
                    nextId.value = nextId.value + 1;
                }}
            />
            <TodoList todos={todos} />
        </div>
    );
};

function AddTodo({ onAdd }: { onAdd: (value: string) => void }) {
    const text = ref('');
    return (
        <div>
            <input
                style='margin-right: 4px;'
                value={text.value}
                oninput={(e) => {
                    const el = e.target as HTMLInputElement;
                    text.value = el.value;
                }}
            />
            <button
                onclick={() => {
                    if (!text.value) return;
                    onAdd(text.value);
                }}
            >
                Add
            </button>
        </div>
    );
}

function TodoList({ todos }: { todos: Ref<Todo[]> }) {
    return (
        <ul>
            {todos.value.map((todo) => <TodoItem todo={todo} />)}
        </ul>
    );
}

function TodoItem({ todo }: { todo: Todo }) {
    return (
        <li>
            <input type='checkbox' checked={todo.done ? true : undefined} />
            <span>{todo.text}</span>
        </li>
    );
}

export default Todos;
