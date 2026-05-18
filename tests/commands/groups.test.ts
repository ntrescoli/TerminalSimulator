import { describe, expect, it } from 'vitest';
import { createTestContext, loadCommand } from '../testUtils';

describe('command: groups', () => {
  it('returns no groups message when user has none', async () => {
    const { base } = createTestContext();
    const Groups = await loadCommand('../src/slices/usermanager/application/commands/groups');
    const out = await Groups.execute(base as any);
    expect(out).toContain('root :');
  });
});
