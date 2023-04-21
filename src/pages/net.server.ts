import { Status } from 'std/http/http_status.ts';

export function get() {
    return Response.json({
        message: `Hello from Deno! Number: ${Math.random()}}`,
    });
}

export async function post(req: Request) {
    try {
        const data = await req.json();
        if (!('name' in data) || !data.name) throw new Error('No name provided');
        return Response.json({
            message: `Created User For ${data.name}`,
        });
    } catch (e) {
        return Response.json({
            message: `Error: ${e.message}`,
        }, { status: Status.BadRequest });
    }
}
