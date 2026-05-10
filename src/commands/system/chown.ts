import { ICommand } from '../../types/types';

export const Chown: ICommand = {
    name: 'chown',
    // description: 'Cambia el propietario y el grupo de un archivo o directorio',
    execute: async ({ args, fs, env, userManager }) => {
        // 1. Solo root puede cambiar propietarios
        if (env.get('USER') !== 'root') {
            return "chown: changing ownership: Operation not permitted";
        }

        if (args.length < 2) {
            return "usage: chown [OWNER][:[GROUP]] FILE...";
        }

        const ownerArg = args[0];
        const targetPath = args[1];

        // 2. Parsear usuario y grupo (ej: "nico:sudo" o "nico")
        const [newOwner, newGroup] = ownerArg.split(':');

        // 3. Validar que el nuevo usuario exista
        if (newOwner && !userManager.getUserByName(newOwner)) {
            return `chown: invalid user: '${newOwner}'`;
        }

        // 4. Validar que el nuevo grupo exista (si se proporcionó)
        if (newGroup && !userManager.getGroups().find(g => g.groupName === newGroup)) {
            return `chown: invalid group: '${newGroup}'`;
        }

        // 5. Aplicar el cambio en el FileSystem
        // Asumimos que tienes un método updateNode en tu fs
        const success = fs.setOwnership(targetPath, newOwner, newGroup);

        if (!success) {
            return `chown: cannot access '${targetPath}': No such file or directory`;
        }

        return ""; // Éxito (silencioso como en Linux)
    }
};