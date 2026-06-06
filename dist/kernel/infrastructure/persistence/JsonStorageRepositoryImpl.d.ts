import { ISliceStateSaver } from '../../domain/ports/out/ISliceStateSaver';
import { IStorageRepository } from '../../domain/ports/out/IStorageRepository';
export declare class JsonStorageRepositoryImpl implements IStorageRepository {
    private readonly configUrl;
    private readonly savers;
    private history;
    constructor(savers: ISliceStateSaver[], configUrl?: string);
    loadData(): Promise<void>;
    saveData(): Promise<any>;
    getHistory(): string[];
    loadHistory(history: string[]): void;
}
//# sourceMappingURL=JsonStorageRepositoryImpl.d.ts.map