export interface PendingAuthState {
    type: string;
    originalLine: string;
}

export class AuthenticationManager {
    private pendingAuth: PendingAuthState | null = null;

    public hasPendingAuth(): boolean {
        return this.pendingAuth !== null;
    }

    public getPendingAuth(): PendingAuthState | null {
        return this.pendingAuth;
    }

    public initiatePendingAuth(type: string, originalLine: string): void {
        this.pendingAuth = { type, originalLine };
    }

    public clearPendingAuth(): void {
        this.pendingAuth = null;
    }

    public getPromptText(targetUser?: string): string {
        if (!this.pendingAuth) return 'Password: ';
        if (this.pendingAuth.type === 'sudo') {
            return `[sudo] password for ${targetUser || 'root'}: `;
        }
        return 'Password: ';
    }

    public buildAuthenticatedCommand(password: string): string {
        if (!this.pendingAuth) return password;

        const originalLine = this.pendingAuth.originalLine;
        if (this.pendingAuth.type === 'sudo') {
            const cleanRaw = originalLine.replace(/^sudo\s+/, '');
            return `sudo --sudo-pass=${password} ${cleanRaw}`;
        }

        return `${originalLine} ${password}`;
    }
}
