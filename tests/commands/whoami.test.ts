import { describe, expect, it } from 'vitest';
import { Whoami } from '../../src/slices/system/application/commands/whoami';
import { createTestContext } from '../testUtils';

describe('command: whoami', () => {
  it('returns the current username from the environment', async () => {
    const { base } = createTestContext();
    const out = await Whoami.execute(base as any);
    expect(out).toBe('root');
  });
});
