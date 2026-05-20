import { describe, expect, it } from 'vitest';
import { CommandExecutor } from '../../src/kernel/application/services/CommandExecutor';
import { CommandRegistry } from '../../src/kernel/application/services/CommandRegistry';
import { createTestContext } from '../testUtils';

describe('wildcard glob expansion', () => {
  it('expands *.txt patterns for rm and removes all matching files', async () => {
    const { fs, env, userManager } = createTestContext();
    fs.touch('a.txt', 'a');
    fs.touch('b.txt', 'b');
    fs.touch('c.log', 'c');

    const registry = new CommandRegistry();
    const executor = new CommandExecutor(env);
    const out = await executor.execute('rm *.txt', registry.getAllCommands(), fs, userManager);

    expect(out).toBe('');
    expect(fs.resolvePath('a.txt')).toBeNull();
    expect(fs.resolvePath('b.txt')).toBeNull();
    expect(fs.resolvePath('c.log')).not.toBeNull();
  });

  it('lists only glob-matching files with ls *.txt', async () => {
    const { fs, env, userManager } = createTestContext();
    fs.touch('note.txt', '1');
    fs.touch('draft.txt', '2');
    fs.touch('image.png', '3');

    const registry = new CommandRegistry();
    const executor = new CommandExecutor(env);
    const out = await executor.execute('ls *.txt', registry.getAllCommands(), fs, userManager);

    expect(out).toContain('draft.txt');
    expect(out).toContain('note.txt');
    expect(out).not.toContain('image.png');
  });

  it('matches single-character wildcard ? correctly', async () => {
    const { fs, env, userManager } = createTestContext();
    fs.touch('a1.txt', '1');
    fs.touch('a2.txt', '2');
    fs.touch('ab.txt', '3');

    const registry = new CommandRegistry();
    const executor = new CommandExecutor(env);
    const out = await executor.execute('ls a?.txt', registry.getAllCommands(), fs, userManager);

    expect(out).toContain('a1.txt');
    expect(out).toContain('a2.txt');
    expect(out).toContain('ab.txt');
  });
});
