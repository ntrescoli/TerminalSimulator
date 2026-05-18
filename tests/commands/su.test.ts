import { describe, expect, it } from 'vitest';
import { Su } from '../../src/slices/usermanager/application/commands/su';
import { createTestContext } from '../testUtils';

describe('command: su', () => {
  it('changes the environment user when target exists', async () => {
    const { base, env, userManager } = createTestContext();
    userManager.getUserByName = () => ({ username: 'guest', home: '/home/guest' });
    base.args = ['guest'];

    const out = await Su.execute(base as any);
    expect(out).toBe('Cambiando al usuario guest...');
    expect(env.get('USER')).toBe('guest');
    expect(env.get('HOME')).toBe('/home/guest');
  });

  it('returns an error when the user does not exist', async () => {
    const { base } = createTestContext();
    base.args = ['missing'];

    const out = await Su.execute(base as any);
    expect(out).toBe("su: user 'missing' does not exist");
  });
});
