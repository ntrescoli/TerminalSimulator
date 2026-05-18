import { describe, expect, it } from 'vitest';
import { Clear } from '../../src/slices/system/application/commands/clear';
import { createTestContext } from '../testUtils';

describe('command: clear', () => {
  it('returns the clear terminal escape code string', async () => {
    const { base } = createTestContext();
    const out = await Clear.execute(base as any);
    expect(out).toBe('COMMAND_CLEAR');
  });
});
