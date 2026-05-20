import { describe, expect, it } from 'vitest';
import { CommandExecutor } from '../../src/kernel/application/services/CommandExecutor';
import type { ICommand } from '../../src/kernel/domain/entities/Command';
import { FileSystem } from '../../src/slices/filesystem/application/services/FileSystem';
import { Environment } from '../../src/slices/system/domain/entities/Environment';
import { createTestContext } from '../testUtils';

describe('command cancellation', () => {
  it('aborts a running command with Ctrl+C / AbortSignal', async () => {
    const env = new Environment();
    const fs = new FileSystem(env);
    const { userManager } = createTestContext();
    const executor = new CommandExecutor(env);

    const sleepCommand: ICommand = {
      name: 'sleep',
      execute: async ({ signal }) => {
        return await new Promise<string>((resolve, reject) => {
          if (signal?.aborted) {
            return reject(new DOMException('Aborted', 'AbortError'));
          }

          const onAbort = () => {
            reject(new DOMException('Aborted', 'AbortError'));
          };

          signal?.addEventListener('abort', onAbort, { once: true });
          setTimeout(() => {
            signal?.removeEventListener('abort', onAbort);
            resolve('done');
          }, 50);
        });
      },
    };

    const commands = new Map<string, ICommand>([['sleep', sleepCommand]]);
    const abortController = new AbortController();

    const promise = executor.execute('sleep', commands, fs, userManager, {}, abortController.signal);
    setTimeout(() => abortController.abort(), 10);

    const result = await promise;
    expect(result).toBe('COMMAND_ABORTED');
  });
});
