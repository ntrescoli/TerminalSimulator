import { ICommand } from '../../../../kernel/domain/entities/Command';

export const Cat: ICommand = {
    name: 'cat',
    execute: ({ args, fs, hasFlag }) => {
        // En Bash, 'cat' sin argumentos se queda esperando stdin, 
        // pero para tu simulador, retornar un string vacío o un aviso es lo ideal.
        if (args.length < 1) return "cat: missing file operand";

        // 1. Obtenemos el objeto Result de la clase
        const result = fs.cat(args[0]);

        // 2. Comprobamos el fallo usando la propiedad correcta de la clase
        if (result.isFailure) {
            return `cat: ${result.error}`; // Ahora es 100% seguro acceder a .error
        }

        // 3. Extraemos el contenido de forma segura con el método de la clase
        const content = result.getValue();

        // 4. Lógica del flag -n (numerar líneas)
        if (hasFlag('-n')) {
            return content.split('\n')
                .map((line, i) => `${(i + 1).toString().padStart(6)}  ${line}`)
                .join('\n');
        }
        
        return content;
    }
};