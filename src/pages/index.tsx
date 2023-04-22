import TodoItem from '@/components/TodoItem.tsx';
import Counter from '@/components/Counter.tsx';
import type { PageType } from '@/lib/types.ts';
import Navigation from '../components/Navigation.tsx';

export type Todo = {
    id: number;
    text: string;
    done: boolean;
};

const Home: PageType = () => {
    const todos = [
        { id: 1, text: 'Handle bundling', done: true },
        { id: 2, text: 'Make reactive', done: false },
        { id: 3, text: 'Improve performance', done: false },
    ];

    const onToggle = (id: number) => {
        const found = todos.find((t) => t.id === id);
        if (found) found.done = !found.done;
        replaceJson(todos);
    };

    const replaceJson = (todos: Todo[]) => {
        const json = document.getElementById('json');
        if (json) json.innerHTML = JSON.stringify(todos, undefined, 2);
    };

    return (
        <div>
            <h1>Home</h1>
            <Navigation />
            {todos.map((todo) => (
                <TodoItem
                    todo={todo}
                    onToggle={() => onToggle(todo.id)}
                />
            ))}
            <pre id='json' style='margin-top: 10px;'>
                {JSON.stringify(todos, undefined, 2)}
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

Home.meta = {
    title: 'Home',
    description: 'Home page',
};

export default Home;
