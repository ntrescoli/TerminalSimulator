import { describe, expect, it } from 'vitest';
import { Uptime } from '../../src/slices/system/application/commands/uptime';
import { createTestContext } from '../testUtils';

describe('command: uptime', () => {
  it('reports uptime, user count, and load average', async () => {
    const { base, userManager } = createTestContext();
    userManager.getUsers = () => [{ username: 'root' }, { username: 'guest' }];

    const out = await Uptime.execute(base as any);
    expect(out).toContain('users');
    expect(out).toContain('load average');
    expect(out).toContain('up');
  });
});
