import { describe, expect, it } from 'vitest';
import { createTestContext, loadCommand } from '../testUtils';

describe('command: delgroup', () => {
  it('removes a group and reports success', async () => {
    const { base } = createTestContext();
    base.args = ['nogroup'];
    const DelGroup = await loadCommand('../src/slices/usermanager/application/commands/delgroup');
    const out = await DelGroup.execute(base as any);
    expect(out).toContain("Removing group 'nogroup'");
  });
});
