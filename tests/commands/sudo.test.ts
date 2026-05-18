import { describe, expect, it } from 'vitest';
import { Sudo } from '../../src/slices/system/application/commands/sudo';
import { createTestContext } from '../testUtils';

describe('command: sudo', () => {
  it('executes a command through the kernel when run as root', async () => {
    const { base } = createTestContext();
    base.args = ['echo', '1'];
    base.rawInput = 'sudo echo 1';

    const out = await Sudo.execute(base as any);
    expect(out).toBe('executed: echo 1');
  });
});
