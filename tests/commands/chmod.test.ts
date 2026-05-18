import { describe, expect, it } from 'vitest';
import { createTestContext, loadCommand } from '../testUtils';

describe('command: chmod', () => {
  it('changes permissions using octal mode', async () => {
    const { base, fs, env } = createTestContext();
    fs.touch('f.txt', 'x');
    base.args = ['644', 'f.txt'];
    env.set('USER', 'root');
    const Chmod = await loadCommand('../src/slices/filesystem/application/commands/chmod');
    const out = await Chmod.execute(base as any);
    expect(out).toBe('');

    const node = fs.resolvePath('f.txt')!;
    // 644 => user: rw-, group: r--, others: r--
    expect(node.permissions.user.read).toBe(true);
    expect(node.permissions.user.write).toBe(true);
    expect(node.permissions.user.execute).toBe(false);
    expect(node.permissions.group.read).toBe(true);
    expect(node.permissions.group.write).toBe(false);
  });
});
