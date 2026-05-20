"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandRegistry = void 0;
const commands_1 = require("../commands");
class CommandRegistry {
    constructor() {
        this.commands = new Map();
        this.loadCommands();
    }
    loadCommands() {
        commands_1.commandList.forEach(cmd => {
            this.commands.set(cmd.name, cmd);
            if (cmd.alias) {
                cmd.alias.forEach(a => this.commands.set(a, cmd));
            }
        });
    }
    getCommand(name) {
        return this.commands.get(name.toLowerCase());
    }
    resolveCommandName(nameOrAlias) {
        const cmd = this.getCommand(nameOrAlias);
        return cmd ? cmd.name : null;
    }
    getAllCommands() {
        return this.commands;
    }
    getCommandNames() {
        return Array.from(new Set(Array.from(this.commands.values()).map(cmd => cmd.name)));
    }
}
exports.CommandRegistry = CommandRegistry;
