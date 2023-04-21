export function get(_req: Request) {
    return Response.json({
        message: 'Hello World',
    });
}

export function post(_req: Request) {
    return Response.json({
        message: 'Hello World 2',
    });
}
