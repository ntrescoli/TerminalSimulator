// Punto de entrada para Vanilla JS
// @ts-ignore
import './style.css';
import { TSTerminal } from './TSTerminal';

const appContainer = document.getElementById('app')!;
new TSTerminal(appContainer);