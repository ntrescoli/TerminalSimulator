import { TSTerminal } from '../TSTerminal';
import '../style.css';

type VMManifestItem = {
    id: string;
    name: string;
    description?: string;
    file: string;
};

const selectElement = document.getElementById('vm-select') as HTMLSelectElement;
const launchButton = document.getElementById('launch-vm') as HTMLButtonElement;
const statusElement = document.getElementById('launch-status') as HTMLDivElement;
const terminalContainer = document.getElementById('terminal-container') as HTMLDivElement;

async function loadManifest(): Promise<VMManifestItem[]> {
    const response = await fetch('/vms/manifest.json');
    if (!response.ok) {
        throw new Error('No se pudo cargar el manifiesto de VMs.');
    }
    return (await response.json()) as VMManifestItem[];
}

function renderVmOptions(vms: VMManifestItem[]) {
    vms.forEach(vm => {
        const option = document.createElement('option');
        option.value = vm.file;
        option.textContent = vm.name;
        option.title = vm.description ?? vm.file;
        selectElement.appendChild(option);
    });
}

function setStatus(message: string, isError = false) {
    statusElement.textContent = message;
    statusElement.style.color = isError ? '#ff6b6b' : '#8ae234';
}

async function launchVirtualMachine(configUrl: string) {
    launchButton.disabled = true;
    selectElement.disabled = true;
    setStatus('Arrancando la máquina virtual...');

    try {
        // 1. Mostramos el contenedor de la terminal
        terminalContainer.classList.remove('hidden');
        
        // 2. Instanciamos tu componente pasándole el contenedor vacío y la configuración
        new TSTerminal(terminalContainer, configUrl);

        setStatus(`Máquina lanzada exitosamente desde ${configUrl}`);
    } catch (error) {
        console.error(error);
        setStatus('Error al lanzar la VM. Revisa la consola.', true);
        launchButton.disabled = false;
        selectElement.disabled = false;
    }
}

const bootstrap = async () => {
    setStatus('Cargando configuraciones de VM...');
    try {
        const vms = await loadManifest();
        renderVmOptions(vms);
        setStatus('Selecciona una VM y pulsa Lanzar máquina.');
    } catch (error) {
        console.error(error);
        setStatus('No se pudo cargar el manifiesto de VM.', true);
        launchButton.disabled = true;
        selectElement.disabled = true;
    }
};

launchButton.addEventListener('click', () => {
    launchVirtualMachine(selectElement.value);
});

bootstrap();