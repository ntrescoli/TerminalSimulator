import { describe, expect, it } from 'vitest';
import { Cal } from '../../src/slices/system/application/commands/cal';
import { createTestContext } from '../testUtils';

describe('command: cal', () => {
  it('executes and returns a string', async () => {
    const { base } = createTestContext();
    const out = await Cal.execute(base as any);
    expect(typeof out).toBe('string');
  });
});
