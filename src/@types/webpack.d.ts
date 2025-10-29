// Type declarations for Webpack's require.context
declare interface RequireContext {
    keys(): string[];
    (id: string): any;
    <T>(id: string): T;
    resolve(id: string): string;
    id: string;
}

declare interface NodeRequire {
    context(
        directory: string,
        useSubdirectories?: boolean,
        regExp?: RegExp,
        mode?: "sync" | "eager" | "weak" | "lazy" | "lazy-once"
    ): RequireContext;
}

// Extend the global require interface
declare var require: NodeRequire; 