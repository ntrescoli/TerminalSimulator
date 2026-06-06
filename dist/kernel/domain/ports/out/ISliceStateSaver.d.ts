export interface ISliceStateSaver {
    readonly key: string;
    getState(): any;
    loadState(data: any): void;
}
//# sourceMappingURL=ISliceStateSaver.d.ts.map