import { describe, expect, it } from 'vitest';
import { createTestContext, loadCommand } from '../testUtils';

describe('command: touch', () => {
  it('creates a file and can be read via fs', async () => {
    const { base, fs } = createTestContext();
    base.args = ['tmp.txt'];
    const Touch = await loadCommand('../src/slices/filesystem/application/commands/touch');
    const out = await Touch.execute(base as any);
    expect(out).toBe('');

    const node = fs.resolvePath('tmp.txt');
    expect(node).toBeTruthy();
    expect(node!.type).toBe('file');
  });
});
