import { describe, expect, it } from 'vitest';
import { Chgrp } from '../../src/slices/system/application/commands/chgrp';
import { createTestContext } from '../testUtils';

describe('command: chgrp', () => {
  it('changes file group when group exists', async () => {
    const { base, fs, userManager } = createTestContext();
    fs.touch('f', 'x');
    const file = fs.resolvePath('f');
    if (file) file.group = 'guest';

    userManager.getGroups = () => [{ groupName: 'root', members: ['root'] }];
    base.args = ['root', 'f'];

    const out = await Chgrp.execute(base as any);
    expect(out).toBe('');

    const node = fs.resolvePath('f');
    expect(node).toBeTruthy();
    expect(node!.group).toBe('root');
  });
});
