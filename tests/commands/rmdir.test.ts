import { describe, expect, it } from 'vitest';
import { createTestContext, loadCommand } from '../testUtils';

describe('command: rmdir', () => {
  it('removes an empty directory', async () => {
    const { base, fs } = createTestContext();
    fs.mkdir('e');
    base.args = ['e'];
    const Rmdir = await loadCommand('../src/slices/filesystem/application/commands/rmdir');
    const out = await Rmdir.execute(base as any);
    expect(out).toBe('');
    expect(fs.resolvePath('e')).toBeNull();
  });
});
