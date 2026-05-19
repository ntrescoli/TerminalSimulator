export class CommandHistoryNavigator {
    private currentIndex: number = -1;
    private history: string[];

    constructor(history: string[]) {
        this.history = history;
    }

    public goUp(): string {
        if (this.history.length === 0) return '';

        if (this.currentIndex === -1) {
            this.currentIndex = this.history.length - 1;
        } else if (this.currentIndex > 0) {
            this.currentIndex--;
        }

        return this.history[this.currentIndex] || '';
    }

    public goDown(): string {
        if (this.currentIndex === -1) return '';

        if (this.currentIndex < this.history.length - 1) {
            this.currentIndex++;
            return this.history[this.currentIndex] || '';
        }

        this.currentIndex = -1;
        return '';
    }

    public reset(): void {
        this.currentIndex = -1;
    }
}
