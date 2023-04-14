import { ComponentType, createNode, isComponentType } from '@/lib/jsx-runtime';
import { DOMParser } from 'deno-dom';
import * as esbuildWasm from 'esbuild/wasm';
import * as esbuildNative from 'esbuild/native';
import { denoPlugin } from 'esbuild-deno-loader';

const esbuild: typeof esbuildWasm = Deno.run === undefined ? esbuildWasm : esbuildNative;

const TEMPLATE = await Deno.readTextFile('./src/index.html');

interface PageMeta {
    hydrate?: boolean;
}

interface Page {
    component: ComponentType;
    file: string;
    meta?: PageMeta;
}

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

const bundleFile = async (sourcefile: string) => {
    await ensureEsbuildInitialized();
    const result = await esbuild.build({
        entryPoints: [new URL(sourcefile, import.meta.url).href],
        bundle: true,
        format: 'esm',
        // metafile: true,
        jsx: 'automatic',
        jsxImportSource: '@/lib',
        treeShaking: true,
        // TODO: Fix identifiers
        // minify: true,
        minifyWhitespace: true,
        // minifyIdentifiers: true,
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
    const output = result.outputFiles?.[0]?.text;

    if (!output) throw new Error(`Failed to transform`);

    return output;
};

export const runtime = await bundleFile(`./jsx-runtime.ts`);
export const hydrate = await bundleFile(`./hydrate.ts`);

const pageMap: Record<string, Page> = {};
for await (const dirEntry of Deno.readDir('./src/pages')) {
    if (dirEntry.isFile) {
        const file = await bundleFile(`../pages/${dirEntry.name}`);

        const module = await import(`../pages/${dirEntry.name}`);
        if (!isComponentType(module.default)) {
            throw new Error(`Module ${dirEntry.name} does not default export a valid component`);
        }

        let pathName = dirEntry.name.split('.')[0];
        if (pathName === 'index') pathName = '/';
        pageMap[pathName] = {
            component: module.default,
            meta: module.meta,
            file,
        };
    }
}

function getComponentForPath(path: string): Page {
    const page = pageMap[path] || pageMap['404'];
    if (!page) throw new Error(`No 404 page found`);
    return page;
}

export function render(url: URL): string {
    const page = getComponentForPath(url.pathname);
    const vnode = page.component();

    const document = new DOMParser().parseFromString(TEMPLATE, 'text/html');
    if (!document?.documentElement) throw new Error('Failed to parse document template');

    document.body?.appendChild(createNode(document, vnode));

    if (page.meta?.hydrate) {
        const bundle = document.createElement('script');
        bundle.setAttribute('type', 'module');
        bundle.innerHTML = page.file;
        bundle.innerHTML += `window.component = ${page.component.name};`;
        bundle.innerHTML += hydrate;

        // TODO: Fix import paths
        bundle.innerHTML = bundle.innerHTML.replace(/@\/lib/g, './lib');

        document.body?.appendChild(bundle);
    }

    return document.documentElement.outerHTML;
}
