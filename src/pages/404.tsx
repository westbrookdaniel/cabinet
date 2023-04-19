import type { PageType } from '@/lib/types.ts';

const NotFound: PageType = () => {
    return <h1>Page Not Found</h1>;
};

NotFound.meta = { hydrate: false };

export default NotFound;
