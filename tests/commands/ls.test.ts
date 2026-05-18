import { describe, expect, it } from 'vitest';
import { createTestContext, loadCommand } from '../testUtils';

describe('command: ls', () => {
  it('lists created files and directories', async () => {
    const { base, fs } = createTestContext();
    // prepare
    fs.touch('one.txt', '1');
    fs.mkdir('dir1');

    base.args = ['.'];
    const Ls = await loadCommand('../src/slices/filesystem/application/commands/ls');
    const out = await Ls.execute(base as any);

    expect(out).toContain('one.txt');
    expect(out).toContain('dir1/');
  });
});
