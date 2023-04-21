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

    function onToggle(id: string) {
        const todo = todos.find((todo) => todo.id === id);
        if (todo) todo.done = !todo.done;
        const el = document.getElementById('todos');
        if (el) renderNode(el, <TodoList onToggle={onToggle} todos={todos} />);
    }

    function onAdd(text: string) {
        todos.unshift({ id: getId(), text, done: false });
        const el = document.getElementById('todos');
        if (el) renderNode(el, <TodoList onToggle={onToggle} todos={todos} />);
    }

    return (
        <div>
            <h1>Todos</h1>
            <AddTodo onAdd={onAdd} />
            <div id='todos'>
                <TodoList onToggle={onToggle} todos={todos} />
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

function TodoList({ todos, onToggle }: { todos: Todo[]; onToggle: (id: string) => void }) {
    return (
        <div style='margin-top: 14px; display: flex; flex-direction: column; gap: 4px;'>
            {todos.map((todo) => <TodoItem todo={todo} onToggle={onToggle} />)}
        </div>
    );
}

function TodoItem({ todo, onToggle }: { todo: Todo; onToggle: (id: string) => void }) {
    return (
        <label style={`display: block; text-decoration: ${todo.done ? 'line-through' : 'unset'}`}>
            <input
                type='checkbox'
                checked={todo.done ? true : undefined}
                onchange={() => onToggle(todo.id)}
            />
            {todo.text}
        </label>
    );
}

export default Todos;
