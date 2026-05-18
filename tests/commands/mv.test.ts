import { describe, expect, it } from 'vitest';
import { createTestContext, loadCommand } from '../testUtils';

describe('command: mv', () => {
  it('moves a file from src to dest', async () => {
    const { base, fs } = createTestContext();
    fs.touch('a.txt', 'x');
    base.args = ['a.txt', 'b.txt'];
    const Mv = await loadCommand('../src/slices/filesystem/application/commands/mv');
    const out = await Mv.execute(base as any);
    expect(out).toBe('');

    expect(fs.resolvePath('a.txt')).toBeNull();
    const dest = fs.resolvePath('b.txt');
    expect(dest).toBeTruthy();
    expect(dest!.content).toBe('x');
  });
});
