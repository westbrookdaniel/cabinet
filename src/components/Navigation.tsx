const routes = {
    '/': 'Home',
    '/todos': 'Todos',
    '/net': 'Network',
};

const activeStyles = 'font-weight: bold; text-decoration: underline;';

export default function Navigation() {
    const currentPath = window.router.pathname;
    return (
        <nav style='display: flex; gap: 8px; margin-bottom: 32px;'>
            {Object.entries(routes).map(([path, name]) => (
                <a href={path} style={currentPath === path ? activeStyles : ''}>
                    {name}
                </a>
            ))}
        </nav>
    );
}
