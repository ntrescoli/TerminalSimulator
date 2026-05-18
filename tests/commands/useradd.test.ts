import { describe, expect, it } from 'vitest';
import { createTestContext, loadCommand } from '../testUtils';

describe('command: useradd', () => {
  it('adds a new user and returns created message', async () => {
    const { base } = createTestContext();
    base.args = ['newuser'];
    const UserAdd = await loadCommand('../src/slices/usermanager/application/commands/useradd');
    const out = await UserAdd.execute(base as any);
    expect(out).toContain("user 'newuser' added");
    expect(out).toContain('UID: 1000');
  });
});
