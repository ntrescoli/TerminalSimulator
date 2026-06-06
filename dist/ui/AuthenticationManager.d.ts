export interface PendingAuthState {
    type: string;
    originalLine: string;
}
export declare class AuthenticationManager {
    private pendingAuth;
    hasPendingAuth(): boolean;
    getPendingAuth(): PendingAuthState | null;
    initiatePendingAuth(type: string, originalLine: string): void;
    clearPendingAuth(): void;
    getPromptText(targetUser?: string): string;
    buildAuthenticatedCommand(password: string): string;
}
//# sourceMappingURL=AuthenticationManager.d.ts.map