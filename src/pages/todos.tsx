import type { PageType } from '@/lib/types.ts';
import { getId, withFormData } from '@/lib/utils.ts';
import { renderNode } from '@/lib/render.ts';
import Navigation from '../components/Navigation.tsx';

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

    const todosNode = <TodoList onToggle={onToggle} todos={todos} />;

    function onToggle(id: string) {
        const todo = todos.find((todo) => todo.id === id);
        if (todo) todo.done = !todo.done;
        const el = document.getElementById('todos');
        if (el) renderNode(el, todosNode);
    }

    function onAdd(text: string) {
        todos.unshift({ id: getId(), text, done: false });
        const el = document.getElementById('todos');
        if (el) renderNode(el, todosNode);
    }

    return (
        <div>
            <h1>Todos</h1>
            <Navigation />
            <AddTodo onAdd={onAdd} />
            <div id='todos'>
                {todosNode}
            </div>
        </div>
    );
};

type AddForm = {
    newtodo: string;
};

function AddTodo({ onAdd }: { onAdd: (value: string) => void }) {
    const id = getId();

    return (
        <form
            id={id}
            onsubmit={withFormData<AddForm>(({ newtodo: text }, el) => {
                onAdd(text);
                el.reset();
            })}
        >
            <label style='display: flex; flex-direction: column; font-size: 12px; gap: 4px;'>
                New Todo
                <div>
                    <input name='newtodo' style='margin-right: 4px;' />
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
