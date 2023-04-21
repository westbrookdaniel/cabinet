export function get(req: Request) {
    console.log(req);
    return {
        body: {
            message: 'Hello World',
        },
    };
}

export function post(req: Request) {
    console.log(req);
    return {
        body: {
            message: 'Hello World 2',
        },
    };
}
