export interface ISliceStateSaver {
    readonly key: string; // 'fileSystem', 'users', 'env', etc.
    getState(): any;
    loadState(data: any): void;
}