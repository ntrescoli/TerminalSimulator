import { describe, expect, it } from 'vitest';
import { History } from '../../src/slices/system/application/commands/history';
import { createTestContext } from '../testUtils';

describe('command: history', () => {
  it('lists stored history entries with indexes', async () => {
    const { base } = createTestContext();
    const out = await History.execute(base as any);
    expect(out).toContain('1');
    expect(out).toContain('ls');
    expect(out).toContain('pwd');
  });

  it('clears history with -c flag', async () => {
    const { base, kernel } = createTestContext();
    base.flagValues['-c'] = true;
    const out = await History.execute(base as any);
    expect(out).toBe('');
    expect(kernel.getHistory()).toHaveLength(0);
  });
});
