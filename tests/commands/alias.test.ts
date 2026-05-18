import { describe, expect, it } from 'vitest';
import { Alias } from '../../src/slices/system/application/commands/alias';
import { createTestContext } from '../testUtils';

describe('command: alias', () => {
  it('defines a new alias and returns empty output', async () => {
    const { base, env } = createTestContext();
    base.args = ['ll=ls -la'];
    base.rawInput = `alias ll='ls -la'`;

    const out = await Alias.execute(base as any);
    expect(out).toBe('');
    expect(env.getAlias('ll')).toBe('ls -la');
  });

  it('shows an alias when requested without equal sign', async () => {
    const { base, env } = createTestContext();
    env.setAlias('ll', 'ls -la');
    base.args = ['ll'];
    base.rawInput = 'alias ll';

    const out = await Alias.execute(base as any);
    expect(out).toBe("alias ll='ls -la'");
  });
});
