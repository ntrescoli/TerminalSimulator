import React from 'react';
import { ReactTerminal } from 'terminal-simulator';
import 'terminal-simulator/style.css';

/**
 * Ejemplo básico de usar ReactTerminal en un proyecto React
 */
export function BasicExample() {
  return (
    <div style={{ width: '100%', height: '600px' }}>
      <h1>Terminal Simulator en React</h1>
      <ReactTerminal />
    </div>
  );
}

/**
 * Ejemplo con estilos personalizados
 */
export function StyledExample() {
  return (
    <div className="custom-terminal-container">
      <header>
        <h1>🖥️ Mi Terminal</h1>
      </header>
      <main>
        <ReactTerminal />
      </main>
    </div>
  );
}

/**
 * Ejemplo con layout completo (similar a VS Code)
 */
export function LayoutExample() {
  return (
    <div className="app-container">
      <aside className="sidebar">
        <nav>
          <h3>Herramientas</h3>
          <ul>
            <li>📁 Archivos</li>
            <li>🔍 Búsqueda</li>
            <li>🧪 Tests</li>
            <li>🐛 Debug</li>
          </ul>
        </nav>
      </aside>

      <section className="main-content">
        <header className="tabs">
          <div className="tab active">
            <span>🖥️ Terminal</span>
          </div>
        </header>

        <div className="editor-area">
          <ReactTerminal />
        </div>
      </section>

      <style>{`
        .app-container {
          display: flex;
          height: 100vh;
          background: #1e1e1e;
          color: #e0e0e0;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .sidebar {
          width: 250px;
          background: #252526;
          border-right: 1px solid #3e3e42;
          padding: 16px;
          overflow-y: auto;
        }

        .sidebar h3 {
          margin-bottom: 12px;
          font-size: 0.85rem;
          text-transform: uppercase;
          color: #888;
        }

        .sidebar ul {
          list-style: none;
        }

        .sidebar li {
          padding: 8px 12px;
          cursor: pointer;
          border-radius: 4px;
          transition: background 0.2s;
        }

        .sidebar li:hover {
          background: #37373d;
        }

        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .tabs {
          display: flex;
          background: #1e1e1e;
          border-bottom: 1px solid #3e3e42;
          padding: 0;
        }

        .tab {
          padding: 12px 16px;
          border-bottom: 2px solid transparent;
          cursor: pointer;
          transition: all 0.2s;
          background: #2d2d30;
          margin: 0 2px;
          border-radius: 4px 4px 0 0;
        }

        .tab.active {
          background: #1e1e1e;
          border-bottom-color: #007acc;
        }

        .editor-area {
          flex: 1;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}

export default BasicExample;
