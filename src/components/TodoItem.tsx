import { Todo } from '@/pages/index.tsx';

interface Props {
    todo: Todo;
    onToggle: () => void;
}

export default function TodoItem({ todo, onToggle }: Props) {
    return (
        <div>
            <input
                type='checkbox'
                checked={todo.done ? true : undefined}
                onclick={onToggle}
            />
            <span>{todo.text}</span>
        </div>
    );
}
