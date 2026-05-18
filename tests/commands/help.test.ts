import { describe, expect, it } from 'vitest';
import { Help } from '../../src/slices/system/application/commands/help';
import { createTestContext } from '../testUtils';

describe('command: help', () => {
  it('lists available commands in output', async () => {
    const { base } = createTestContext();
    const out = await Help.execute(base as any);
    expect(out).toContain('Comandos disponibles:');
    expect(out).toContain('ls');
    expect(out).toContain('echo');
  });
});
