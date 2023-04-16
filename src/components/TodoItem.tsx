import { Todo } from '@/pages/index.tsx';

interface Props {
    todo: Todo;
}

export default function TodoItem({ todo }: Props) {
    return (
        <div>
            <input
                type='checkbox'
                checked={todo.done ? true : undefined}
                onclick={() => {
                    todo.done = !todo.done;
                    console.log(todo);
                }}
            />
            <span>{todo.text}</span>
        </div>
    );
}
