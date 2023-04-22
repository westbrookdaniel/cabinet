import type { PageType } from '@/lib/types.ts';

const NotFound: PageType = () => {
    return <h1>Page Not Found</h1>;
};

NotFound.meta = {
    title: 'Page Not Found',
    description: 'We had trouble finding that page',
};

export default NotFound;
