import TodoItem from '@/components/TodoItem.tsx';

export type Todo = {
    id: number;
    text: string;
    done: boolean;
};

function Home() {
    const todos = [
        { id: 1, text: 'Handle bundling', done: true },
        { id: 2, text: 'Make reactive', done: false },
        { id: 3, text: 'Improve performance', done: false },
    ];

    return (
        <div>
            {todos.map((todo) => (
                <TodoItem
                    todo={todo}
                />
            ))}
            <pre style='margin-top: 10px' id='json'>
                {JSON.stringify(todos, undefined, 2)}
            </pre>
        </div>
    );
}

export default Home;
