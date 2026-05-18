import { describe, expect, it } from 'vitest';
import { createTestContext, loadCommand } from '../testUtils';

describe('command: deluser', () => {
  it('returns error if trying to delete current user, otherwise success', async () => {
    const { base, env } = createTestContext();
    env.set('USER', 'root');
    base.args = ['someone'];
    const DelUser = await loadCommand('../src/slices/usermanager/application/commands/deluser');
    const out = await DelUser.execute(base as any);
    expect(out).toContain("Removing user 'someone'");
  });
});
