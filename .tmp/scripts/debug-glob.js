"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testUtils_ts_1 = require("../tests/testUtils.ts");
const CommandRegistry_ts_1 = require("../src/kernel/application/services/CommandRegistry.ts");
const CommandExecutor_ts_1 = require("../src/kernel/application/services/CommandExecutor.ts");
(async function () {
    try {
        const { fs, env, userManager } = (0, testUtils_ts_1.createTestContext)();
        fs.touch('a1.txt', '1');
        fs.touch('a2.txt', '2');
        fs.touch('ab.txt', '3');
        fs.touch('note.txt', 'n');
        fs.touch('draft.txt', 'd');
        fs.touch('image.png', 'p');
        const registry = new CommandRegistry_ts_1.CommandRegistry();
        const executor = new CommandExecutor_ts_1.CommandExecutor(env);
        console.log('--- rm *.txt ---');
        console.log(await executor.execute('rm *.txt', registry.getAllCommands(), fs, userManager));
        // recreate some files
        fs.touch('a1.txt', '1');
        fs.touch('a2.txt', '2');
        fs.touch('ab.txt', '3');
        console.log('--- ls a?.txt ---');
        console.log(await executor.execute('ls a?.txt', registry.getAllCommands(), fs, userManager));
        console.log('--- ls *.txt ---');
        console.log(await executor.execute('ls *.txt', registry.getAllCommands(), fs, userManager));
    }
    catch (err) {
        console.error('DEBUG ERROR:', err && err.stack ? err.stack : err);
        process.exitCode = 2;
    }
})();
