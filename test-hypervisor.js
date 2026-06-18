import { Kernel } from './src/kernel/Kernel.ts'
import { TSTerminal } from './src/TSTerminal.ts';

const container = document.getElementById('viewport');
const btnVm1 = document.getElementById('btn-vm1');
const btnVm2 = document.getElementById('btn-vm2');
const btnPower = document.getElementById('btn-power');

// El hipervisor ahora guarda las instancias de TSTerminal completas
// Pasamos un Kernel independiente a cada una desde el inicio
const instances = {
    'alfa': new TSTerminal(container, new Kernel()),
    'beta': new TSTerminal(container, new Kernel())
};

let currentVmId = 'alfa';

async function switchVM(targetVmId) {
    // 1. Ocultamos la terminal visual activa actual (hace un display: none)
    instances[currentVmId].detach();

    // 2. Cambiamos al ID de destino
    currentVmId = targetVmId;

    // 3. Hacemos boot de la terminal destino (hará un display: block si ya existía, manteniendo todo el texto)
    await instances[currentVmId].boot();

    updateUiStates();
}

function updateUiStates() {
    // Actualizar pestañas
    if (currentVmId === 'alfa') {
        btnVm1.classList.add('active');
        btnVm2.classList.remove('active');
    } else {
        btnVm2.classList.add('active');
        btnVm1.classList.remove('active');
    }

    // El hipervisor puede acceder al kernel interno de la instancia para ver su energía
    // (Asegúrate de que 'instances[currentVmId].kernel' sea accesible o añade un getter)
    const currentKernel = instances[currentVmId]['kernel']; 
    if (currentKernel.getPowerState() === 'POWER_ON') {
        btnPower.innerText = "🔌 Apagar Máquina";
        btnPower.className = "power-on";
    } else {
        btnPower.innerText = "⚡ Encender Máquina";
        btnPower.className = "power-off";
    }
}

// Listener del botón de Power en test-hypervisor.js
btnPower.addEventListener('click', async () => {
    const currentTerminal = instances[currentVmId];
    const currentKernel = currentTerminal.kernel; // Acceso directo ya que es public

    if (currentKernel.getPowerState() === 'POWER_ON') {
        currentKernel.shutdown();
    } else {
        currentKernel.powerOn();
    }

    // Le decimos a la terminal actual que ajuste el input/output según el nuevo estado
    currentTerminal.applyPowerStateVisuals();

    // Actualizamos el botón del hipervisor (Cambio de color verde/rojo)
    updateUiStates();
});

btnVm1.addEventListener('click', () => { if (currentVmId !== 'alfa') switchVM('alfa'); });
btnVm2.addEventListener('click', () => { if (currentVmId !== 'beta') switchVM('beta'); });

// Arrancamos la primera de inicio
instances['alfa'].boot().then(updateUiStates);