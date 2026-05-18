import { describe, expect, it } from 'vitest';
import { Unalias } from '../../src/slices/system/application/commands/unalias';
import { createTestContext } from '../testUtils';

describe('command: unalias', () => {
  it('removes an existing alias and returns empty output', async () => {
    const { base, env } = createTestContext();
    env.setAlias('x', 'echo x');
    base.args = ['x'];
    const out = await Unalias.execute(base as any);
    expect(out).toBe('');
    expect(env.getAlias('x')).toBeUndefined();
  });

  it('returns an error when alias does not exist', async () => {
    const { base } = createTestContext();
    base.args = ['missing'];
    const out = await Unalias.execute(base as any);
    expect(out).toBe('unalias: missing: not found');
  });
});
