// Punto de entrada para Vanilla JS
import './style.css';
import { TSTerminal } from './TSTerminal';

const appContainer = document.getElementById('app')!;
const terminal = new TSTerminal(appContainer);

// Con defaults
terminal.boot();

// O con un JSON específico en otro momento
// terminal.boot('/configs/custom.json');