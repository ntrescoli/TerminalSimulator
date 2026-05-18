import { describe, expect, it } from 'vitest';
import { PathResolver } from '../../src/slices/filesystem/application/services/PathResolver';
import { createTestContext, loadCommand } from '../testUtils';

describe('command: cd', () => {
  it('changes current directory and updates PWD', async () => {
    const { base, fs, env } = createTestContext();
    fs.mkdir('d');
    base.args = ['d'];
    const Cd = await loadCommand('../src/slices/filesystem/application/commands/cd');
    const out = await Cd.execute(base as any);
    expect(out).toBe('');

    expect(fs.getCurrentDirectory().name).toBe('d');
    expect(env.get('PWD')).toBe(PathResolver.getAbsolutePath(fs.getCurrentDirectory()));
  });
});
