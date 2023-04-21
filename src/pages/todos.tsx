import type { PageType } from '@/lib/types.ts';
import { getId } from '@/lib/utils.ts';
import { renderNode } from '@/lib/render.ts';

type Todo = {
    id: string;
    text: string;
    done: boolean;
};

const Todos: PageType = () => {
    const todos = [
        { id: getId(), text: 'Handle bundling', done: true },
        { id: getId(), text: 'Make reactive', done: true },
        { id: getId(), text: 'Improve performance', done: false },
    ];

    return (
        <div>
            <h1>Todos</h1>
            <AddTodo
                onAdd={(text) => {
                    todos.unshift({ id: getId(), text, done: false });
                    const el = document.getElementById('todos');
                    if (el) renderNode(el, <TodoList todos={todos} />);
                }}
            />
            <div id='todos'>
                <TodoList todos={todos} />
            </div>
        </div>
    );
};

function AddTodo({ onAdd }: { onAdd: (value: string) => void }) {
    const id = getId();

    return (
        <form
            id={id}
            onsubmit={(e: SubmitEvent) => {
                e.preventDefault();
                const el = e.target as HTMLFormElement;
                const text = new FormData(el).get('new-todo') as string;
                onAdd(text);
                el.reset();
            }}
        >
            <label style='display: flex; flex-direction: column; font-size: 12px; gap: 4px;'>
                New Todo
                <div>
                    <input name='new-todo' style='margin-right: 4px;' />
                    <button type='submit'>
                        Add
                    </button>
                </div>
            </label>
        </form>
    );
}

function TodoList({ todos }: { todos: Todo[] }) {
    return (
        <div style='margin-top: 14px; display: flex; flex-direction: column; gap: 4px;'>
            {todos.map((todo) => <TodoItem data-key={todo.id} todo={todo} />)}
        </div>
    );
}

function TodoItem({ todo }: { todo: Todo }) {
    return (
        <label style='display: block;'>
            <input
                type='checkbox'
                checked={todo.done ? true : undefined}
                onchange={(e) => {
                    const el = e.target as HTMLInputElement;
                    todo.done = el.checked;
                }}
            />
            {todo.text}
        </label>
    );
}

Todos.meta = { noSsr: true };

export default Todos;
