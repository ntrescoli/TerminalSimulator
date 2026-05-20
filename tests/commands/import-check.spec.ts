import { describe, expect, it } from 'vitest';

describe('import-check', () => {
  it('imports modules dynamically without throwing', async () => {
    const modPaths = [
      '../testUtils',
      '../../src/kernel/application/services/CommandRegistry',
      '../../src/kernel/application/services/CommandExecutor'
    ];

    for (const p of modPaths) {
      let ok = true;
      try {
        await import(p);
      } catch (e) {
        ok = false;
        console.error('Import failed for', p, e && e.stack ? e.stack : e);
      }
      expect(ok).toBe(true);
    }
  });
});
