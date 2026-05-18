import { describe, expect, it } from 'vitest';
import { createTestContext, loadCommand } from '../testUtils';

describe('command: file', () => {
  it('identifies regular files and directories', async () => {
    const { base, fs } = createTestContext();
    fs.touch('f.txt', 'x');
    base.args = ['f.txt'];
    const File = await loadCommand('../src/slices/filesystem/application/commands/file');
    const out = await File.execute(base as any);
    expect(out).toBe('f.txt: regular file');

    // directory
    fs.mkdir('d');
    base.args = ['d'];
    const out2 = await File.execute(base as any);
    expect(out2).toBe('d: directory');
  });
});
