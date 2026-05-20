"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cal = void 0;
exports.Cal = {
    name: 'cal',
    execute: ({ args }) => {
        const now = new Date();
        let month = now.getMonth(); // 0 - 11
        let year = now.getFullYear();
        // 1. Validar y parsear argumentos si existen (Ej: cal 12 2026 o cal 2026)
        if (args.length === 1) {
            // Si solo hay un argumento, Bash lo interpreta como el AÑO completo
            const parsedYear = parseInt(args[0], 10);
            if (isNaN(parsedYear) || parsedYear < 1 || parsedYear > 9999) {
                return `cal: illegal year value: use 1-9999`;
            }
            // Para no saturar la terminal imprimiendo los 12 meses, 
            // los sistemas simplificados suelen mostrar el mes actual de ese año.
            year = parsedYear;
        }
        else if (args.length >= 2) {
            // Si hay dos argumentos: cal <mes> <año>
            const parsedMonth = parseInt(args[0], 10);
            const parsedYear = parseInt(args[1], 10);
            if (isNaN(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
                return `cal: ${args[0]} is not a valid month (1-12)`;
            }
            if (isNaN(parsedYear) || parsedYear < 1 || parsedYear > 9999) {
                return `cal: illegal year value: use 1-9999`;
            }
            month = parsedMonth - 1; // Ajustamos al formato 0-11 de JS
            year = parsedYear;
        }
        // 2. Nombres de los meses para la cabecera
        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        // 3. Cálculos de los días del mes
        const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 (Dom) a 6 (Sáb)
        const totalDaysInMonth = new Date(year, month + 1, 0).getDate(); // Truco de JS para sacar el último día
        // 4. Construcción de la interfaz de texto (Grid)
        const output = [];
        // Cabecera: "    Month Year" centrado
        const headerText = `${monthNames[month]} ${year}`;
        const padding = Math.max(0, Math.floor((20 - headerText.length) / 2));
        output.push(" ".repeat(padding) + headerText);
        // Días de la semana abreviados al estilo Unix estándar
        output.push("Su Mo Tu We Th Fr Sa");
        // Rellenar los huecos vacíos del inicio de la primera semana
        let currentWeek = "   ".repeat(firstDayOfMonth);
        // Iterar día por día e introducirlos en la cuadrícula
        for (let day = 1; day <= totalDaysInMonth; day++) {
            // Formateamos el número para que ocupe siempre 2 caracteres (ej: " 5" o "12")
            const dayStr = day.toString().padStart(2, ' ');
            currentWeek += dayStr + " ";
            // Si la semana se llena (llegamos al Sábado) o es el último día del mes, cerramos la línea
            if ((firstDayOfMonth + day) % 7 === 0 || day === totalDaysInMonth) {
                output.push(currentWeek.trimEnd());
                currentWeek = ""; // Reset de semana
            }
        }
        return output.join('\n');
    }
};
