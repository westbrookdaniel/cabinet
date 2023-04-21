import { bundleFiles } from '@/lib/server/bundle.ts';

const headers = { 'Content-Type': 'application/javascript' };

// not sure if these even does anything on deno deploy
const cache = new Map<string, string>();

export async function serveBundle(path: string) {
    // use cache if we have it
    if (cache.has(path)) {
        return new Response(cache.get(path), { headers });
    }

    // path is something like bundle/pages/index.js
    const pathToBundle = import.meta.resolve('../../' + path);

    console.log(
        pathToBundle,
        pathToBundle.slice(0, pathToBundle.lastIndexOf('/')),
        import.meta.url,
        new URL(pathToBundle.slice(0, pathToBundle.lastIndexOf('/')), import.meta.url).pathname,
    );

    // find the original file extension
    let ext: string | null = null;
    for await (
        const dirEntry of Deno.readDir(
            new URL(pathToBundle.slice(0, pathToBundle.lastIndexOf('/')), import.meta.url).pathname,
        )
    ) {
        if (dirEntry.name.startsWith(pathToBundle.slice(pathToBundle.lastIndexOf('/') + 1, -3))) {
            ext = dirEntry.name.slice(dirEntry.name.lastIndexOf('.'));
            break;
        }
    }
    if (!ext) throw new Error('Could not find file extension for ' + pathToBundle);

    // bundle the file
    const outputs = await bundleFiles([
        pathToBundle.slice(0, -3) + ext,
    ]);

    // serve bundled file and cache output
    const text = outputs[0].text;
    cache.set(path, text);
    return new Response(text, { headers });
}
