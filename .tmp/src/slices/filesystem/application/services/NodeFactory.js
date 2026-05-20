"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeFactory = void 0;
class NodeFactory {
    /**
     * Crea un nodo desde cero (para mkdir, touch, etc.)
     */
    static create(name, type, owner, parent = null, content = "") {
        return {
            name,
            type,
            parent,
            content,
            children: [],
            createdAt: Date.now(),
            owner: owner,
            group: owner, // Estilo Unix: el grupo principal es el nombre del usuario
            permissions: {
                user: { read: true, write: true, execute: type === 'dir' },
                group: { read: true, write: false, execute: type === 'dir' },
                others: { read: true, write: false, execute: type === 'dir' }
            }
        };
    }
}
exports.NodeFactory = NodeFactory;
