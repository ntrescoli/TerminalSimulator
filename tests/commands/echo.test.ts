import { describe, expect, it } from 'vitest';
import { Echo } from '../../src/slices/system/application/commands/echo';
import { createTestContext } from '../testUtils';

describe('command: echo', () => {
  it('executes and returns a string', async () => {
    const { base } = createTestContext();
    base.args = ['hello'];
    const out = await Echo.execute(base as any);
    expect(typeof out).toBe('string');
  });
});
