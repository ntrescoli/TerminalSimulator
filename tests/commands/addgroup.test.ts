import { describe, expect, it } from 'vitest';
import { createTestContext, loadCommand } from '../testUtils';

describe('command: addgroup', () => {
  it('creates a group and reports success', async () => {
    const { base } = createTestContext();
    base.args = ['newgroup'];
    const AddGroup = await loadCommand('../src/slices/usermanager/application/commands/addgroup');
    const out = await AddGroup.execute(base as any);
    expect(out).toContain("Añadiendo el grupo 'newgroup'");
  });
});
