import { describe, expect, it } from 'vitest';
import { createTestContext, loadCommand } from '../testUtils';

describe('command: mkdir', () => {
  it('creates a directory in the filesystem', async () => {
    const { base, fs } = createTestContext();
    base.args = ['newdir'];
    const Mkdir = await loadCommand('../src/slices/filesystem/application/commands/mkdir');
    const out = await Mkdir.execute(base as any);
    expect(out).toBe('');

    const node = fs.resolvePath('newdir');
    expect(node).toBeTruthy();
    expect(node!.type).toBe('dir');
  });
});
