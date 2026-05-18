import { describe, expect, it } from 'vitest';
import { DateCommand } from '../../src/slices/system/application/commands/date';
import { createTestContext } from '../testUtils';

describe('command: date', () => {
  it('formats a custom year string when provided +%Y', async () => {
    const { base } = createTestContext();
    base.args = ['+%Y'];
    const out = await DateCommand.execute(base as any);
    expect(out).toBe(new Date().getFullYear().toString());
  });
});
