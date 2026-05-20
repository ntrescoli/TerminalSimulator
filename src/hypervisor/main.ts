import { Kernel } from '../kernel/Kernel';
import { AuthenticationManager } from '../ui/AuthenticationManager';
import { CommandHistoryExpander } from '../ui/CommandHistoryExpander';
import { CommandHistoryNavigator } from '../ui/CommandHistoryNavigator';
import { TerminalUI } from '../ui/Terminal';
import { TerminalInputHandler } from '../ui/TerminalInputHandler';

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
const outputElement = document.getElementById('output') as HTMLDivElement;
const inputElement = document.getElementById('terminal-input') as HTMLInputElement;
const promptElement = document.getElementById('prompt') as HTMLSpanElement;

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
        const kernel = new Kernel(configUrl);
        await kernel.boot();

        terminalContainer.classList.remove('hidden');
        setStatus(`Máquina lanzada con ${configUrl}`);

        const terminal = new TerminalUI(outputElement, inputElement, promptElement);
        terminal.clear();

        const authManager = new AuthenticationManager();
        const historyExpander = new CommandHistoryExpander();
        const historyNavigator = new CommandHistoryNavigator(kernel.getHistory());
        const inputHandler = new TerminalInputHandler(kernel, terminal, authManager, historyExpander, historyNavigator);
        inputHandler.attach(inputElement);

        terminal.print('Hypervisor VM iniciada. Bienvenido.');
        terminal.print(`Estado inicial cargado desde ${configUrl}`);
        terminal.print('');
        terminal.updatePrompt(kernel.getPromptText());
        inputElement.focus();
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
