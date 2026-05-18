import { describe, expect, it } from 'vitest';
import { createTestContext, loadCommand } from '../testUtils';

describe('command: pwd', () => {
  it('returns the current working directory path', async () => {
    const { base } = createTestContext();
    const Pwd = await loadCommand('../src/slices/filesystem/application/commands/pwd');
    const out = await Pwd.execute(base as any);
    expect(out).toBe('/');
  });
});
