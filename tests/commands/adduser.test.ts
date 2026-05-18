import { describe, expect, it } from 'vitest';
import { createTestContext, loadCommand } from '../testUtils';

describe('command: adduser', () => {
  it('adds a user to a group when args length 2', async () => {
    const { base } = createTestContext();
    base.args = ['joe', 'staff'];
    const AddUser = await loadCommand('../src/slices/usermanager/application/commands/adduser');
    const out = await AddUser.execute(base as any);
    expect(out).toContain("Adding user 'joe' to group 'staff'");
  });

  it("suggests using useradd when only username provided", async () => {
    const { base } = createTestContext();
    base.args = ['joe'];
    const AddUser = await loadCommand('../src/slices/usermanager/application/commands/adduser');
    const out = await AddUser.execute(base as any);
    expect(out).toContain("Use 'useradd'");
  });
});
