import * as esbuildWasm from 'esbuild/wasm';
import * as esbuildNative from 'esbuild/native';
import { denoPlugin } from 'esbuild-deno-loader';
import { isDev } from '@/lib/server/env.ts';

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

const getBuildOptions = (sourcefiles: string[], distPath: string): esbuildWasm.BuildOptions => ({
    entryPoints: sourcefiles.map((file) => new URL(file, import.meta.url).href),
    format: 'esm',
    jsx: 'automatic',
    jsxImportSource: '@/lib',
    treeShaking: true,
    minify: !isDev,
    bundle: true,
    minifyWhitespace: !isDev,
    minifyIdentifiers: !isDev,
    absWorkingDir: Deno.cwd(),
    outdir: distPath,
    // TODO: Add asset hashing
    // assetNames: 'assets/[name]-[hash]',
    // chunkNames: 'chunks/[name]-[hash]',
    pure: ['jsx', 'jsxs'],
    platform: 'neutral',
    target: ['chrome99', 'firefox99', 'safari15'],
    plugins: [denoPlugin({
        importMapURL: new URL('../../../import_map.json', import.meta.url),
    })],
    write: true,
});

export async function bundleFiles(sourcefiles: string[]) {
    const distPath = new URL('../../../public/_bundle', import.meta.url).pathname;

    await ensureEsbuildInitialized();

    // await Deno.remove(distPath, { recursive: true });

    // TODO: Add this instead of server restart
    // if (isDev) {
    //     const ctx = await esbuild.context(getBuildOptions(sourcefiles, distPath));
    //     await ctx.watch();
    // } else {
    await esbuild.build(getBuildOptions(sourcefiles, distPath));
    // }
}

export async function bundle() {
    const files: string[] = ['../hydrate.ts'];
    // Get just PageModules from pages dir
    for await (const dirEntry of Deno.readDir('./src/pages')) {
        if (!dirEntry.isFile) break;
        if (dirEntry.name.includes('.server')) break;
        files.push(`../../pages/${dirEntry.name}`);
    }
    const resolvedFiles = files.map((f) => new URL(f, import.meta.url).pathname);

    console.log(resolvedFiles.map((f) => f.replace(Deno.cwd(), '')).join('\n'));

    await bundleFiles(resolvedFiles);
}

if (import.meta.main) {
    console.log('Bundling:');
    await bundle();
    console.log('Done!');
    Deno.exit(0);
}
