import { describe, expect, it } from 'vitest';
import { Env } from '../../src/slices/system/application/commands/env';
import { createTestContext } from '../testUtils';

describe('command: env', () => {
  it('prints environment variables in KEY=VALUE format', async () => {
    const { base } = createTestContext();
    const out = await Env.execute(base as any);
    expect(out).toContain('USER=root');
    expect(out).toContain('HOSTNAME=ubuntu-server');
  });
});
