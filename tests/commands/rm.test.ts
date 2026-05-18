import { describe, expect, it } from 'vitest';
import { createTestContext, loadCommand } from '../testUtils';

describe('command: rm', () => {
  it('removes a file when present and is silent on success', async () => {
    const { base, fs } = createTestContext();
    fs.touch('file.txt', 'x');
    base.args = ['file.txt'];
    const Rm = await loadCommand('../src/slices/filesystem/application/commands/rm');
    const out = await Rm.execute(base as any);
    expect(out).toBe('');
    expect(fs.resolvePath('file.txt')).toBeNull();
  });

  it('is silent when -f and file does not exist', async () => {
    const { base } = createTestContext();
    base.args = ['nope'];
    base.hasFlag = (f: string) => f === '-f';
    const Rm = await loadCommand('../src/slices/filesystem/application/commands/rm');
    const out = await Rm.execute(base as any);
    expect(out).toBe('');
  });
});
