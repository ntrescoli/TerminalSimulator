import { describe, expect, it } from 'vitest';
import { createTestContext, loadCommand } from '../testUtils';

describe('command: cp', () => {
  it('copies a file from src to dest', async () => {
    const { base, fs } = createTestContext();
    fs.touch('src.txt', 'a');
    base.args = ['src.txt', 'dst.txt'];
    const Cp = await loadCommand('../src/slices/filesystem/application/commands/cp');
    const out = await Cp.execute(base as any);
    expect(out).toBe('');

    const src = fs.resolvePath('src.txt');
    const dst = fs.resolvePath('dst.txt');
    expect(src).toBeTruthy();
    expect(dst).toBeTruthy();
    expect(dst!.content).toBe(src!.content);
  });
});
