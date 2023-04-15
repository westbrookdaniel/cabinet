import * as esbuildWasm from 'esbuild/wasm';
import * as esbuildNative from 'esbuild/native';
import { denoPlugin } from 'esbuild-deno-loader';

const esbuild: typeof esbuildWasm = Deno.run === undefined ? esbuildWasm : esbuildNative;

let esbuildInitialized: boolean | Promise<void> = false;
async function ensureEsbuildInitialized() {
    if (esbuildInitialized === false) {
        if (Deno.run === undefined) {
            const wasmURL = new URL('./esbuild_v0.17.11.wasm', import.meta.url).href;
            esbuildInitialized = fetch(wasmURL).then(async (r) => {
                const resp = new Response(r.body, {
                    headers: { 'Content-Type': 'application/wasm' },
                });
                const wasmModule = await WebAssembly.compileStreaming(resp);
                await esbuild.initialize({
                    wasmModule,
                    worker: false,
                });
            });
        } else {
            esbuild.initialize({});
        }
        await esbuildInitialized;
        esbuildInitialized = true;
    } else if (esbuildInitialized instanceof Promise) {
        await esbuildInitialized;
    }
}

export async function bundleFiles(sourcefiles: string[]) {
    await ensureEsbuildInitialized();

    const result = await esbuild.build({
        entryPoints: sourcefiles.map((file) => new URL(file, import.meta.url).href),
        bundle: true,
        format: 'esm',
        // metafile: true,
        jsx: 'automatic',
        jsxImportSource: '@/lib',
        treeShaking: true,
        minify: true,
        minifyWhitespace: true,
        minifyIdentifiers: true,
        absWorkingDir: Deno.cwd(),
        outdir: '.',
        outfile: '',
        loader: {
            '.ts': 'ts',
            '.tsx': 'tsx',
            '.json': 'json',
            '.css': 'css',
            '.txt': 'text',
            '.png': 'dataurl',
            '.jpg': 'dataurl',
            '.gif': 'dataurl',
            '.svg': 'dataurl',
            '.ico': 'dataurl',
        },
        platform: 'neutral',
        target: ['chrome99', 'firefox99', 'safari15'],
        plugins: [denoPlugin({
            importMapURL: new URL('../../import_map.json', import.meta.url),
        })],
        write: false,
    });

    if (result.warnings.length) {
        console.error(result.warnings);
    }

    const outputs = result.outputFiles;
    if (!outputs) throw new Error(`Failed to transform`);
    return outputs;
}

export async function serveBundle(path: string) {
    // path is something like bundle/pages/index.js
    const pathToBundle = '../' + path;

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

    // serve bundled file
    return new Response(outputs[0].text, {
        headers: { 'Content-Type': 'application/javascript' },
    });
}
