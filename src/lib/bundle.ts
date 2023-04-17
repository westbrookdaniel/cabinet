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

const isDev = true;

export async function bundleFiles(sourcefiles: string[]) {
    await ensureEsbuildInitialized();

    const result = await esbuild.build({
        entryPoints: sourcefiles.map((file) => new URL(file, import.meta.url).href),
        bundle: true,
        format: 'esm',
        jsx: 'automatic',
        jsxImportSource: '@/lib',
        treeShaking: true,
        minify: !isDev,
        minifyWhitespace: !isDev,
        minifyIdentifiers: !isDev,
        absWorkingDir: Deno.cwd(),
        outdir: '.',
        outfile: '',
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
