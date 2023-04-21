import { ModuleType, PageModule, ServerModule } from '@/lib/types.ts';

export function isFileForServerModule(filePath: string): boolean {
    return filePath.includes('.server');
}

export function isPageModule(module: ModuleType): module is PageModule {
    return 'default' in module && typeof module.default === 'function';
}

export function isServerModule(module: ModuleType): module is ServerModule {
    return 'get' in module || 'post' in module;
}
