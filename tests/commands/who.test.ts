import { describe, expect, it } from 'vitest';
import { Who } from '../../src/slices/system/application/commands/who';
import { createTestContext } from '../testUtils';

describe('command: who', () => {
  it('outputs the current user and hostname', async () => {
    const { base, env } = createTestContext();
    env.set('USER', 'tester');
    env.set('HOSTNAME', 'test-host');

    const out = await Who.execute(base as any);
    expect(out).toContain('tester');
    expect(out).toContain('(test-host)');
    expect(out).toContain('pts/0');
  });
});
