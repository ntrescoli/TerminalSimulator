/**
 * Terminal Simulator - Public API
 *
 * Export all public classes and types for component usage.
 */

export { Kernel } from './kernel/Kernel';
export { TerminalUI } from './ui/Terminal';

// Type exports for component integration
export type { ICommand } from './kernel/domain/entities/Command';
export type { INode } from './slices/filesystem/domain/entities/Node';
export type { User } from './slices/usermanager/domain/entities/User';
export type { Group } from './slices/usermanager/domain/entities/Group';
export type { Environment } from './slices/system/domain/entities/Environment';

// Services
export { FileSystem } from './slices/filesystem/application/services/FileSystem';
export { UserManagerService } from './slices/usermanager/application/services/UserManagerService';
export type { SystemOrchestrator } from './kernel/application/services/SystemOrchestrator';
