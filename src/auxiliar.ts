touch(path: string, content: string = ""): void {
    const lastSlash = path.lastIndexOf('/');
    const dirPath = lastSlash === -1 ? "." : path.substring(0, lastSlash);
    const fileName = lastSlash === -1 ? path : path.substring(lastSlash + 1);

    const targetDir = this.resolvePath(dirPath);
    
    if (targetDir && targetDir.type === 'dir') {
        const existing = targetDir.children.find(n => n.name === fileName);
        if (existing && existing.type === 'file') {
            existing.content = content;
        } else {
            targetDir.children.push({
                name: fileName,
                type: 'file',
                children: [],
                parent: targetDir,
                content: content,
                createdAt: Date.now(),
                owner: 'root'
            });
        }
    }
}

export const Touch: ICommand = {
    name: 'touch',
    execute: ({ args, fs }) => {
        if (args.length < 1) return "touch: missing file operand";

        const path = args[0];
        const content = args[1] || ""; // Aquí sí existe 'args'

        // Usamos writeFile que ya tiene el .replace(/\\n/g, '\n')
        fs.writeFile(path, content);
        
        return "";
    }
};