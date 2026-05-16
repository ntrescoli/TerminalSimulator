export interface ISliceStateSaver {
    readonly key: string; // 'fileSystem', 'users', 'groups', 'env', etc.
    getState(): any;
    loadState(data: any): void;
}