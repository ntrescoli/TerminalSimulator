import type { ISliceStateSaver } from '@/kernel/domain/ports/out/ISliceStateSaver';
import type { IStorageRepository } from '@/kernel/domain/ports/out/IStorageRepository';

export class JsonStorageRepositoryImpl implements IStorageRepository {
    private readonly savers: Map<string, ISliceStateSaver> = new Map();
    private history: string[] = []; // El historial sí puede ser nativo del Kernel si se maneja aquí

    constructor(savers: ISliceStateSaver[], private readonly configUrl = '/vms/default.json') {
        savers.forEach(saver => this.savers.set(saver.key, saver));
    }

    public async loadData(): Promise<void> {
        try {
            const response = await fetch(this.configUrl);
            if (!response.ok) throw new Error();
            const config = await response.json();

            // Orquestación pura y ciega:
            for (const [key, saver] of this.savers.entries()) {
                if (config[key]) {
                    saver.loadState(config[key]);
                }
            }

            if (config.history) {
                this.history = config.history;
            }
        } catch {
            console.warn('Storage: Error loading configuration, applying generic defaults.');
            // Aquí puedes disparar estados vacíos iniciales en los savers si lo deseas
        }
    }

    // NO FUNCIONA, devuelve el json vacio. Ademas, no se como coger users y GROUPS en el bucle
    public async saveData(): Promise<any> {
        const fullState: Record<string, any> = {};

        // Recolectamos el estado de todos los slices dinámicamente
        for (const [key, saver] of this.savers.entries()) {
            fullState[key] = saver.getState();
        }

        fullState['history'] = this.history;

        return fullState;
    }

    // Métodos para que el Kernel acceda a su propio historial sin inyectar la clase Kernel
    public getHistory(): string[] { return this.history; }
    public loadHistory(history: string[]): void { this.history = history; }
}