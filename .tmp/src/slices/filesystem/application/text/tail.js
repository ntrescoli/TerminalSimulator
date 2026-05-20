"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tail = void 0;
exports.Tail = {
    name: 'tail',
    valuedFlags: ['n'],
    execute: async ({ args, flagValues, fs, pipeInput }) => {
        let maxLines = 10;
        if (flagValues && flagValues['-n']) {
            const val = parseInt(flagValues['-n']);
            if (!isNaN(val) && val > 0)
                maxLines = val;
        }
        let filePath = args[0] ? args[0].trim() : "";
        let content = "";
        if (pipeInput) {
            content = pipeInput;
        }
        else {
            if (!filePath)
                return "tail: missing file operand";
            const node = fs.resolvePath(filePath);
            if (!node || node.type !== 'file') {
                return `tail: cannot open '${filePath}' for reading: No such file or directory`;
            }
            content = node.content || "";
        }
        const lines = content.split('\n');
        if (lines.length > 1 && lines[lines.length - 1] === "") {
            lines.pop();
        }
        return lines.slice(-maxLines).join('\n');
    }
};
