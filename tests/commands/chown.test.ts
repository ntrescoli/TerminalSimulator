import { describe, expect, it } from 'vitest';
import { Chown } from '../../src/slices/system/application/commands/chown';
import { createTestContext } from '../testUtils';

describe('command: chown', () => {
  it('changes file ownership when run by root', async () => {
    const { base, env, fs, userManager } = createTestContext();
    fs.touch('f', 'x');
    const file = fs.resolvePath('f');
    if (file) file.owner = 'guest';

    userManager.getUserByName = (name: string) => ({ username: name, home: `/home/${name}` });
    userManager.getGroups = () => [{ groupName: 'root', members: ['root'] }];
    base.args = ['root', 'f'];

    const out = await Chown.execute(base as any);
    expect(out).toBe('');

    const node = fs.resolvePath('f');
    expect(node).toBeTruthy();
    expect(node!.owner).toBe('root');
  });
});
