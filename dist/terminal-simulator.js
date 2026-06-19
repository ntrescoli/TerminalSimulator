var _ = Object.defineProperty;
var j = (o, e, t) => e in o ? _(o, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : o[e] = t;
var m = (o, e, t) => j(o, typeof e != "symbol" ? e + "" : e, t);
import { jsx as W } from "react/jsx-runtime";
import { useRef as O, useEffect as R } from "react";
class p {
  constructor(e, t, r) {
    m(this, "isSuccess");
    m(this, "isFailure");
    m(this, "_error");
    m(this, "_value");
    this.isSuccess = e, this.isFailure = !e, this._error = t, this._value = r;
  }
  static ok(e) {
    return new p(!0, void 0, e);
  }
  static fail(e) {
    return new p(!1, e, void 0);
  }
  /**
   * Extrae el valor en caso de éxito.
   */
  getValue() {
    if (!this.isSuccess)
      throw new Error("No se puede obtener el valor de un resultado fallido.");
    return this._value;
  }
  /**
   * Getter para el error. Al usar 'get error()', en tus comandos 
   * accedes de forma natural usando 'result.error'.
   */
  getError() {
    if (!this.isFailure)
      throw new Error("No se puede obtener el error de un resultado exitoso.");
    return this._error || "Unknown error";
  }
}
const y = {
  // --- FILESYSTEM ERRORS ---
  FS: {
    NOT_FOUND: (o) => `bash: ${o}: No such file or directory`,
    PERMISSION_DENIED: (o) => `bash: ${o}: Permission denied`,
    IS_DIRECTORY: (o) => `bash: ${o}: Is a directory`,
    NOT_A_DIRECTORY: (o) => `bash: ${o}: Not a directory`,
    ALREADY_EXISTS: (o) => `bash: ${o}: File exists`,
    NOT_EMPTY: (o) => `bash: ${o}: Directory not empty`,
    INVALID_NAME: (o) => `bash: ${o}: invalid file name`,
    DISK_FULL: () => "bash: write error: No space left on device",
    UNKNOWN_TYPE: (o) => `bash: ${o}: unknown file type`
  }
};
class H {
  /**
   * Valida si un usuario tiene permiso para realizar una acción
   */
  static canAccess(e, t, r, s) {
    return t === "root" ? !0 : ["/etc", "/bin", "/var", "/sbin"].some((a) => s.startsWith(a)) && r === "write" ? !1 : e.owner === t ? e.permissions.user[r] : e.permissions.others[r];
  }
}
class A {
  /**
   * Crea un nodo desde cero (para mkdir, touch, etc.)
   */
  static create(e, t, r, s = null, n = "") {
    return {
      name: e,
      type: t,
      parent: s,
      content: n,
      children: [],
      createdAt: Date.now(),
      owner: r,
      group: r,
      // Estilo Unix: el grupo principal es el nombre del usuario
      permissions: {
        user: { read: !0, write: !0, execute: t === "dir" },
        group: { read: !0, write: !1, execute: t === "dir" },
        others: { read: !0, write: !1, execute: t === "dir" }
      }
    };
  }
}
class S {
  /**
   * Toma una ruta y devuelve el nodo correspondiente o null.
   */
  static resolve(e, t, r) {
    if (!e || e === ".") return t;
    if (e === "/") return r;
    const s = e.startsWith("~") ? e.replace("~", "/home") : e;
    let n = s.startsWith("/") ? r : t;
    const i = s.split("/").filter(Boolean);
    for (const a of i)
      if (a !== ".")
        if (a === "..")
          n = n.parent || n;
        else {
          const c = n.children.find((u) => u.name === a);
          if (!c) return null;
          n = c;
        }
    return n;
  }
  /**
   * Calcula la ruta absoluta (string) de cualquier nodo.
   */
  static getAbsolutePath(e) {
    let t = e, r = "";
    for (; t !== null && t.parent !== null; )
      r = "/" + t.name + r, t = t.parent;
    return r || "/";
  }
}
class B {
  constructor(e) {
    m(this, "root");
    m(this, "currentDirectory");
    m(this, "previousDirectory");
    m(this, "env");
    this.env = e, this.root = A.create("/", "dir", "root"), this.currentDirectory = this.root, this.previousDirectory = this.root;
  }
  getCurrentDirectory() {
    return this.currentDirectory;
  }
  setCurrentDirectory(e) {
    this.currentDirectory = e;
  }
  getRoot() {
    return this.root;
  }
  setRoot(e) {
    this.root = e;
  }
  checkAccess(e, t) {
    const r = this.env.get("USER") || "guest", s = S.getAbsolutePath(e);
    return H.canAccess(e, r, t, s);
  }
  // --- MÉTODOS DE DATOS ---
  // public getNodes(path: string = ".", showHidden: boolean = false): INode[] {
  //     const node = this.resolvePath(path);
  //     if (!node) throw new Error(`ls: cannot access '${path}': No such file or directory`);
  //     if (node.type === 'file') return [node];
  //     let nodes = [...node.children];
  //     if (!showHidden) {
  //         nodes = nodes.filter(n => !n.name.startsWith('.'));
  //     }
  //     return nodes.sort((a, b) => a.name.localeCompare(b.name));
  // }
  getNodes(e = ".", t = !1) {
    const r = this.resolvePath(e);
    if (!r)
      return p.fail(`cannot access '${e}': No such file or directory`);
    if (r.type === "file")
      return p.ok([r]);
    let s = [...r.children];
    return t || (s = s.filter((n) => !n.name.startsWith("."))), p.ok(s.sort((n, i) => n.name.localeCompare(i.name)));
  }
  readdir(e) {
    const t = this.resolvePath(e);
    return t && t.type === "dir" && t.children ? t.children.map((r) => r.name) : [];
  }
  getChildren(e) {
    const t = this.resolvePath(e);
    return t && t.type === "dir" && t.children ? t.children : [];
  }
  resolvePath(e) {
    return S.resolve(e, this.currentDirectory, this.root);
  }
  // --- MÉTODOS DE ACCIÓN ---
  /**
   * Escribe contenido en un archivo.
   * @param append Si es true, añade al final. Si es false, sobrescribe.
   */
  writeFile(e, t, r = !1) {
    const s = t.replace(/\\n/g, `
`);
    if (r) {
      const n = this.cat(e);
      if (n.isSuccess) {
        const i = (n.getValue().trimEnd() + `
` + s).trim();
        return this.touch(e, i);
      }
    }
    return this.touch(e, s);
  }
  /**
   * Crea un archivo o actualiza su contenido.
   * Devuelve Result<INode> para que el llamador tenga acceso al nodo creado/modificado.
   */
  touch(e, t = "") {
    const r = e.lastIndexOf("/"), s = r === -1 ? "." : e.substring(0, r) || "/", n = r === -1 ? e : e.substring(r + 1), i = this.resolvePath(s);
    if (!i || i.type !== "dir")
      return p.fail(y.FS.NOT_FOUND(e));
    if (!this.checkAccess(i, "write"))
      return p.fail(y.FS.PERMISSION_DENIED(e));
    const a = i.children.find((c) => c.name === n);
    if (a)
      return a.type === "dir" ? p.fail(y.FS.IS_DIRECTORY(e)) : this.checkAccess(a, "write") ? (t !== "" && (a.content = t), p.ok(a)) : p.fail(y.FS.PERMISSION_DENIED(e));
    {
      const c = this.env.get("USER") || "root", u = A.create(n, "file", c, i, t);
      return i.children.push(u), p.ok(u);
    }
  }
  mkdir(e) {
    const t = e.lastIndexOf("/"), r = t === -1 ? "." : e.substring(0, t) || "/", s = t === -1 ? e : e.substring(t + 1), n = this.resolvePath(r);
    if (!n || n.type !== "dir")
      return p.fail(y.FS.NOT_FOUND(e));
    if (!this.checkAccess(n, "write"))
      return p.fail(y.FS.PERMISSION_DENIED(e));
    if (n.children.some((a) => a.name === s))
      return p.fail(y.FS.ALREADY_EXISTS(e));
    const i = A.create(s, "dir", this.env.get("USER"), n);
    return n.children.push(i), p.ok(i);
  }
  remove(e, t = !1) {
    const r = this.resolvePath(e);
    return r ? r === this.root ? p.fail("cannot remove root directory '/'") : r === this.currentDirectory ? p.fail("cannot remove current directory '.' or '..'") : r.type === "dir" && !t ? p.fail(y.FS.IS_DIRECTORY(e)) : r.parent && !this.checkAccess(r.parent, "write") ? p.fail(y.FS.PERMISSION_DENIED(e)) : (r.parent && (r.parent.children = r.parent.children.filter((s) => s !== r), r.parent = null), p.ok()) : p.fail(y.FS.NOT_FOUND(e));
  }
  // @/slices/filesystem/application/services/FileSystem.ts
  removeDirectory(e) {
    const t = this.resolvePath(e);
    if (!t)
      return p.fail(y.FS.NOT_FOUND(e));
    if (t.type !== "dir")
      return p.fail(`Failed to remove '${e}': Not a directory`);
    if (t === this.root)
      return p.fail("cannot remove root directory '/'");
    if (t === this.currentDirectory)
      return p.fail("cannot remove current directory '.'");
    if (t.children.length > 0)
      return p.fail(`Failed to remove '${e}': Directory not empty`);
    const s = t.parent || this.resolvePath(e + "/..");
    return s && !this.checkAccess(s, "write") ? p.fail(y.FS.PERMISSION_DENIED(e)) : (s && (s.children = s.children.filter((n) => n.name !== t.name)), p.ok());
  }
  changeDirectory(e) {
    let t = null;
    return e === "-" ? t = this.previousDirectory : t = this.resolvePath(e), t ? t.type !== "dir" ? p.fail(y.FS.NOT_A_DIRECTORY(e)) : (this.previousDirectory = this.currentDirectory, this.currentDirectory = t, p.ok()) : p.fail(y.FS.NOT_FOUND(e));
  }
  cat(e) {
    const t = this.resolvePath(e);
    return t ? t.type === "dir" ? p.fail(y.FS.IS_DIRECTORY(e)) : this.checkAccess(t, "read") ? p.ok(t.content || "") : p.fail(y.FS.PERMISSION_DENIED(e)) : p.fail(y.FS.NOT_FOUND(e));
  }
  /**
   * Realiza una lectura directa de un archivo del sistema ignorando las restricciones 
   * de permisos del usuario actual. Exclusivo para componentes del Kernel.
   */
  catSystem(e) {
    const t = this.resolvePath(e);
    return t ? t.type !== "file" ? p.fail("Not a file") : p.ok(t.content) : p.fail("File not found");
  }
  // No se usa
  getPreviousDirectory() {
    return this.previousDirectory;
  }
  // public setOwnership(path: string, owner?: string, group?: string): boolean {
  //     const node = this.resolvePath(path);
  //     if (!node) return false;
  //     if (owner !== undefined) node.owner = owner;
  //     if (group !== undefined) node.group = group;
  //     return true;
  // }
  /**
   * Cambia el propietario y/o grupo de un nodo de forma segura.
   * @returns Un Result que indica éxito o el mensaje de error específico de Unix.
   */
  setOwnership(e, t, r, s, n) {
    const i = this.resolvePath(e);
    if (!i)
      return p.fail(`cannot access '${e}': No such file or directory`);
    if (t !== "root") {
      if (i.owner !== t)
        return p.fail(`changing group of '${e}': Operation not permitted`);
      if (n !== void 0 && !r.includes(t))
        return p.fail(`changing group of '${e}': Group membership required`);
    }
    return s !== void 0 && (i.owner = s), n !== void 0 && (i.group = n), p.ok();
  }
  getModificationTime(e) {
    var t;
    return ((t = this.resolvePath(e)) == null ? void 0 : t.mtime) || 0;
  }
  getType(e) {
    return e.type === "dir" ? p.ok("dir") : e.type === "file" ? p.ok("file") : p.fail(y.FS.UNKNOWN_TYPE(e.name));
  }
  /**
   * Método auxiliar para clonar un nodo en profundidad (Deep Copy)
   */
  cloneNode(e, t = null) {
    const r = {
      ...e,
      parent: t,
      // Clonamos recursivamente los hijos si es un directorio
      children: []
    };
    return e.children && (r.children = e.children.map((s) => this.cloneNode(s, r))), r;
  }
  copy(e, t, r = !1) {
    const s = S.resolve(e, this.currentDirectory, this.root);
    if (!s) return p.fail(`cp: cannot stat '${e}': No such file or directory`);
    if (s.type === "dir" && !r)
      return p.fail(`cp: -r not specified; omitting directory '${e}'`);
    const n = S.resolve(t, this.currentDirectory, this.root);
    let i = null, a = s.name;
    if (n && n.type === "dir")
      i = n;
    else {
      const u = t.lastIndexOf("/");
      if (u === -1)
        i = this.currentDirectory, a = t;
      else {
        const l = t.substring(0, u) || "/";
        i = S.resolve(l, this.currentDirectory, this.root), a = t.substring(u + 1);
      }
    }
    if (!i || i.type !== "dir")
      return p.fail(`cp: cannot create regular file '${t}': Not a directory`);
    const c = this.cloneNode(s, i);
    return c.name = a, i.children = i.children.filter((u) => u.name !== a), i.children.push(c), p.ok();
  }
  move(e, t) {
    const r = S.resolve(e, this.currentDirectory, this.root);
    if (!r) return p.fail(`mv: cannot stat '${e}': No such file or directory`);
    if (r === this.root) return p.fail("mv: cannot move root directory '/'");
    const s = S.resolve(t, this.currentDirectory, this.root);
    let n = null, i = r.name;
    if (s && s.type === "dir")
      n = s;
    else {
      const a = t.lastIndexOf("/");
      if (a === -1)
        n = this.currentDirectory, i = t;
      else {
        const c = t.substring(0, a) || "/";
        n = S.resolve(c, this.currentDirectory, this.root), i = t.substring(a + 1);
      }
    }
    return !n || n.type !== "dir" ? p.fail(`mv: cannot move to '${t}': Not a directory`) : (r.parent && (r.parent.children = r.parent.children.filter((a) => a !== r)), r.parent = n, r.name = i, n.children = n.children.filter((a) => a.name !== i), n.children.push(r), p.ok());
  }
  // --- CARGA INICIAL DE SEGURIDAD (CENTRALIZAR EN EL FUTURO) ---
  loadDefaults() {
    this.root = A.create("/", "dir", "root"), this.currentDirectory = this.root, this.mkdir("home"), this.mkdir("bin"), this.mkdir("etc"), this.mkdir("var"), this.writeFile("/etc/passwd", `root:x:0:0:root:/root:/bin/bash
guest:x:1000:1000:guest:/home/guest:/bin/bash`), this.writeFile("/etc/group", `root:x:0:
sudo:x:27:guest,nico
`), this.writeFile("home/readme.txt", "Bienvenido al sistema de archivos avanzado.");
  }
}
class Y {
  constructor() {
    m(this, "vars");
    m(this, "aliases", /* @__PURE__ */ new Map());
    this.vars = {};
  }
  /**
   * Obtiene el valor de una variable de entorno.
   * @param key Nombre de la variable (ej: 'USER')
   * @returns El valor de la variable o un string vacío si no existe.
   */
  get(e) {
    return this.vars[e] || "";
  }
  /**
   * Establece o actualiza una variable de entorno.
   * @param key Nombre de la variable
   * @param value Valor a asignar
   */
  set(e, t) {
    this.vars[e] = t;
  }
  /**
   * Verifica si una variable existe en el entorno.
   */
  has(e) {
    return Object.prototype.hasOwnProperty.call(this.vars, e);
  }
  /**
   * Elimina una variable de entorno (equivalente a 'unset' en bash).
   */
  delete(e) {
    delete this.vars[e];
  }
  /**
   * Devuelve una copia de todas las variables actuales.
   * Fundamental para el comando 'env' y para la exportación a JSON.
   */
  getAll() {
    return { ...this.vars };
  }
  setAlias(e, t) {
    this.aliases.set(e || "", t || "");
  }
  getAlias(e) {
    return this.aliases.get(e);
  }
  removeAlias(e) {
    return this.aliases.delete(e);
  }
  getAliases() {
    return Array.from(this.aliases.entries());
  }
  /**
   * Carga un conjunto inicial de variables.
   */
  loadDefaults() {
    this.vars = {
      USER: "root",
      HOSTNAME: "ubuntu-server",
      HOME: "/root",
      PATH: "/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
      SHELL: "/bin/bash",
      PWD: "/",
      TERM: "xterm-256color",
      LANG: "en_US.UTF-8",
      SUDO_USER: ""
    };
  }
}
class q {
  constructor(e, t) {
    m(this, "cachedUsers", []);
    m(this, "cachedGroups", []);
    m(this, "lastUsersSync", -1);
    m(this, "lastShadowSync", -1);
    // 🌟 Nueva marca para trackear /etc/shadow
    m(this, "lastGroupsSync", -1);
    this.fs = e, this.repository = t;
  }
  //  --- SINCRONIZACIÓN DE CACHÉ ---
  /** Comprueba si se ha modificado el archivo de usuarios o de contraseñas manualmente */
  refreshUsers() {
    const e = this.fs.getModificationTime("/etc/passwd"), t = this.fs.getModificationTime("/etc/shadow");
    if (e > this.lastUsersSync || t > this.lastShadowSync) {
      const r = this.repository.getUsers();
      r && r.length > 0 && (this.cachedUsers = r), this.lastUsersSync = e, this.lastShadowSync = t;
    }
  }
  /** Comprueba si se ha modificado el archivo de grupos manualmente */
  refreshGroups() {
    const e = this.fs.getModificationTime("/etc/group");
    if (e > this.lastGroupsSync) {
      const t = this.repository.getGroups();
      t && t.length > 0 && (this.cachedGroups = t), this.lastGroupsSync = e;
    }
  }
  // --- CONSULTAS ---
  getUsers() {
    return this.refreshUsers(), this.cachedUsers;
  }
  getGroups() {
    return this.refreshGroups(), this.cachedGroups;
  }
  getUserByName(e) {
    return this.getUsers().find((t) => t.username === e);
  }
  getGroupByName(e) {
    return this.getGroups().find((t) => t.groupName === e);
  }
  // --- OPERACIONES ---
  /** Actualiza la contraseña de un usuario en el sistema */
  updatePassword(e, t) {
    this.refreshUsers();
    const r = this.cachedUsers.find((s) => s.username === e);
    return r ? (r.password = this.hashPassword(t), this.repository.saveUsers(this.cachedUsers), this.lastShadowSync = this.fs.getModificationTime("/etc/shadow"), null) : `passwd: user '${e}' not found`;
  }
  saveUser(e) {
    if (this.refreshUsers(), this.refreshGroups(), Array.isArray(e))
      return "userManager: cannot save an array of users via saveUser";
    if (this.cachedUsers.some((r) => r && !Array.isArray(r) && r.username === e.username))
      return `useradd: user '${e.username}' already exists`;
    this.cachedGroups = [...this.cachedGroups.filter((r) => r && !Array.isArray(r)), {
      groupName: e.username,
      gid: e.gid,
      members: [e.username]
    }];
    const t = this.cachedUsers.filter((r) => r && !Array.isArray(r));
    return this.cachedUsers = [...t, e], this.repository.saveUsers(this.cachedUsers), this.repository.saveGroups(this.cachedGroups), this.lastUsersSync = this.fs.getModificationTime("/etc/passwd"), this.lastShadowSync = this.fs.getModificationTime("/etc/shadow"), this.lastGroupsSync = this.fs.getModificationTime("/etc/group"), null;
  }
  deleteUser(e) {
    if (this.refreshUsers(), this.refreshGroups(), e === "root") return "deluser: cannot remove root";
    if (!this.cachedUsers.some((s) => s.username === e)) return "user not found";
    const t = this.cachedUsers.filter((s) => s.username !== e), r = this.cachedGroups.filter((s) => s.groupName !== e).map((s) => ({ ...s, members: s.members.filter((n) => n !== e) }));
    return this.repository.saveUsers(t), this.repository.saveGroups(r), this.lastUsersSync = this.fs.getModificationTime("/etc/passwd"), this.lastShadowSync = this.fs.getModificationTime("/etc/shadow"), null;
  }
  saveGroup(e) {
    if (this.refreshGroups(), Array.isArray(e))
      return "userManager: cannot save an array of groups via saveGroup";
    const t = this.cachedGroups.filter((r) => r && !Array.isArray(r));
    return t.some((r) => r.groupName === e.groupName) ? `addgroup: El grupo '${e.groupName}' ya existe.` : t.some((r) => r.gid === e.gid) ? `addgroup: El GID '${e.gid}' ya está en uso.` : (this.cachedGroups = [...t, {
      groupName: e.groupName,
      gid: e.gid,
      members: Array.isArray(e.members) ? e.members : []
    }], this.repository.saveGroups(this.cachedGroups), this.lastGroupsSync = this.fs.getModificationTime("/etc/group"), null);
  }
  deleteGroup(e) {
    if (this.refreshUsers(), this.refreshGroups(), e === "root" || e === "sudo")
      return `delgroup: cannot remove system group '${e}'`;
    if (!this.cachedGroups.some((s) => s.groupName === e))
      return `delgroup: the group '${e}' does not exist`;
    if (this.cachedUsers.some((s) => s.username === e))
      return `delgroup: group '${e}' is the primary group of a user`;
    const r = this.cachedGroups.filter((s) => s.groupName !== e);
    return this.repository.saveGroups(r), this.lastGroupsSync = this.fs.getModificationTime("/etc/group"), null;
  }
  addUserToGroup(e, t) {
    this.refreshUsers(), this.refreshGroups();
    const r = this.cachedGroups.find((s) => s.groupName === t);
    return r ? (r.members.includes(e) || (r.members.push(e), this.repository.saveGroups(this.cachedGroups), this.lastGroupsSync = this.fs.getModificationTime("/etc/group")), null) : "group not found";
  }
  hashPassword(e) {
    let t = 0;
    if (e.length === 0) return "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
    for (let r = 0; r < e.length; r++) {
      const s = e.charCodeAt(r);
      t = (t << 5) - t + s, t |= 0;
    }
    return `$6$rounds=5000$jsTerminalSalt$${Math.abs(t).toString(16).padEnd(16, "f")}`;
  }
  loadDefaults() {
    const e = [
      { username: "root", password: "root", uid: 0, gid: 0, home: "/root", shell: "/bin/bash", fullName: "root" },
      { username: "guest", password: "guest", uid: 1e3, gid: 1e3, home: "/home/guest", shell: "/bin/bash", fullName: "Guest User" }
    ], t = [
      { groupName: "root", gid: 0, members: ["root"] },
      { groupName: "guest", gid: 1e3, members: ["guest"] }
    ];
    this.repository.saveUsers(e), this.repository.saveGroups(t), this.lastUsersSync = this.fs.getModificationTime("/etc/passwd"), this.lastShadowSync = this.fs.getModificationTime("/etc/shadow"), this.lastGroupsSync = this.fs.getModificationTime("/etc/group");
  }
}
class K {
  constructor(e) {
    this.fs = e;
  }
  getUsers() {
    const e = this.fs.cat("/etc/passwd");
    if (!e.isSuccess) return [];
    const t = e.getValue(), r = this.parsePasswd(t), s = this.fs.catSystem("/etc/shadow");
    if (s.isSuccess) {
      const n = this.parseShadow(s.getValue());
      r.forEach((i) => {
        n.has(i.username) && (i.password = n.get(i.username));
      });
    }
    return r;
  }
  getGroups() {
    const e = this.fs.cat("/etc/group");
    if (!e.isSuccess) return [];
    const t = e.getValue();
    return this.parseGroups(t);
  }
  saveUsers(e) {
    const t = e.map(
      (a) => `${a.username}:x:${a.uid}:${a.gid}:${a.fullName}:${a.home}:${a.shell}`
    ).join(`
`);
    this.fs.writeFile("/etc/passwd", t);
    const r = Math.floor(Date.now() / (1e3 * 60 * 60 * 24)), s = this.fs.cat("/etc/shadow"), n = s.isSuccess ? this.parseShadow(s.getValue()) : /* @__PURE__ */ new Map(), i = e.map((a) => {
      const c = a.password || n.get(a.username) || "$6$rounds=5000$jsTerminalSalt$c37ce20fffffffff";
      return `${a.username}:${c}:${r}:0:99999:7:::`;
    }).join(`
`) + `
`;
    this.fs.writeFile("/etc/shadow", i);
  }
  saveGroups(e) {
    const t = e.map((r) => `${r.groupName}:x:${r.gid}:${r.members.join(",")}`).join(`
`);
    this.fs.writeFile("/etc/group", t);
  }
  // -- UTILS --
  parsePasswd(e) {
    return e.split(`
`).map((t) => t.trim()).filter((t) => t !== "" && !t.startsWith("#")).map((t) => {
      const [r, , s, n, i, a, c] = t.split(":");
      return {
        username: r,
        uid: parseInt(s, 10) || 0,
        gid: parseInt(n, 10) || 0,
        fullName: i || r,
        home: a || `/home/${r}`,
        shell: c || "/bin/bash"
      };
    });
  }
  parseShadow(e) {
    const t = /* @__PURE__ */ new Map();
    return e.split(`
`).map((r) => r.trim()).filter((r) => r !== "" && !r.startsWith("#")).forEach((r) => {
      const [s, n] = r.split(":");
      s !== void 0 && n !== void 0 && t.set(s, n);
    }), t;
  }
  parseGroups(e) {
    return e.split(`
`).map((t) => t.trim()).filter((t) => t !== "" && !t.startsWith("#")).map((t) => {
      const [r, , s, n] = t.split(":"), i = n != null && n.trim() ? n.split(",") : [];
      return { groupName: r, gid: parseInt(s, 10) || 0, members: i };
    });
  }
}
class z {
  constructor(e) {
    this.env = e;
  }
  async execute(e, t, r, s, n = null, i) {
    const a = e.trim();
    if (!a) return "";
    if (i != null && i.aborted)
      return "COMMAND_ABORTED";
    if (a.includes("|")) {
      const c = a.split("|").map((l) => l.trim());
      let u = "";
      for (const l of c) {
        if (i != null && i.aborted)
          return "COMMAND_ABORTED";
        u = await this.processCommandLine(l, t, r, s, u, n, i);
      }
      return u;
    }
    return await this.processCommandLine(a, t, r, s, "", n, i);
  }
  async processCommandLine(e, t, r, s, n = "", i = null, a) {
    let c = e.trim(), u = null, l = !1;
    const h = c.match(/>>\s*([^\s]+)$/), d = c.match(/>\s*([^\s]+)$/);
    h ? (l = !0, u = h[1], c = c.replace(/>>\s*[^\s]+$/, "").trim()) : d && (l = !1, u = d[1], c = c.replace(/>\s*[^\s]+$/, "").trim());
    const g = c.indexOf(" "), f = g === -1 ? c : c.substring(0, g), w = g === -1 ? "" : c.substring(g), b = this.env.getAlias(f.trim());
    b && (c = `${b}${w}`.trim());
    const v = this.tokenize(c);
    if (v.length === 0) return "";
    const x = v[0].toLowerCase(), U = v.slice(1), E = t.get(x);
    if (!E) return `-bash: ${x}: command not found`;
    const N = E.valuedFlags || [], P = x === "sudo" ? [...N, "sudo-pass", "--sudo-pass"] : N, k = this.extractAllowedFlagsFromCommand(E, P);
    if (a != null && a.aborted)
      return "COMMAND_ABORTED";
    const { options: T, args: F, flagValues: G } = this.parseArgsAndFlags(U, P, k), L = {
      args: this.expandGlobPatterns(F, r),
      options: T,
      flagValues: G,
      rawArgs: U,
      fs: r,
      env: this.env,
      userManager: s,
      pipeInput: n,
      signal: a,
      kernel: i,
      hasFlag: ($) => T.includes($.startsWith("-") ? $ : `-${$}`),
      rawInput: e
    }, I = await E.execute(L);
    if (a != null && a.aborted)
      return "COMMAND_ABORTED";
    if (u) {
      const $ = r.writeFile(u, I, l);
      return $.isSuccess ? "" : $.getError();
    }
    return I;
  }
  tokenize(e) {
    const t = /"([^"]*)"|'([^']*)'|([^\s]+)/g, r = [];
    let s;
    for (; (s = t.exec(e)) !== null; )
      r.push(s[1] || s[2] || s[3]);
    return r;
  }
  parseArgsAndFlags(e, t = [], r) {
    const s = [], n = [], i = {};
    for (let a = 0; a < e.length; a++) {
      const c = e[a];
      if (c.startsWith("-") && c.length > 1) {
        const u = c.startsWith("--"), l = u ? [c.slice(2)] : c.slice(1).split("");
        let h = !1;
        for (let d = 0; d < l.length; d++) {
          const g = l[d], f = u ? `--${g}` : `-${g}`;
          if (r && !r.has(f))
            if (u) {
              n.push(c), h = !0;
              break;
            } else {
              const w = "-" + l.slice(d).join("");
              n.push(w), h = !0;
              break;
            }
          if (s.push(f), t.includes(g) || t.includes(f)) {
            if (!u && c.slice(d + 2).length > 0) {
              i[f] = c.slice(d + 2), h = !0;
              break;
            } else if (a + 1 < e.length) {
              i[f] = e[a + 1], a++, h = !0;
              break;
            }
          }
        }
        if (h) continue;
      } else
        n.push(c);
    }
    return { options: s, args: n, flagValues: i };
  }
  expandGlobPatterns(e, t) {
    const r = [];
    for (const s of e) {
      if (!s.includes("*") && !s.includes("?")) {
        r.push(s);
        continue;
      }
      const n = s.lastIndexOf("/"), i = n === -1 ? "" : s.substring(0, n + 1), a = n === -1 ? "." : s.substring(0, n) || "/", c = n === -1 ? s : s.substring(n + 1), u = t.resolvePath(a);
      if (!u || u.type !== "dir") {
        r.push(s);
        continue;
      }
      const l = this.globToRegExp(c), h = u.children.filter((d) => d.name.startsWith(".") && !c.startsWith(".") ? !1 : l.test(d.name)).map((d) => `${i}${d.name}`);
      h.length > 0 ? r.push(...h) : r.push(s);
    }
    return r;
  }
  globToRegExp(e) {
    const r = `^${e.replace(/([.+^${}()|[\]\\])/g, "\\$1").replace(/\*/g, ".*").replace(/\?/g, ".")}$`;
    return new RegExp(r);
  }
  extractAllowedFlagsFromCommand(e, t) {
    try {
      const r = e.execute && e.execute.toString && e.execute.toString() || "", s = /hasFlag\(\s*['"`](-{1,2}[A-Za-z0-9-]+)['"`]\s*\)/g, n = /* @__PURE__ */ new Set();
      let i;
      for (; (i = s.exec(r)) !== null; )
        n.add(i[1]);
      for (const a of t)
        a.startsWith("-") || a.startsWith("--") ? n.add(a) : a.length === 1 ? n.add(`-${a}`) : n.add(`--${a}`);
      return n.size > 0 ? n : void 0;
    } catch {
      return;
    }
  }
}
const J = {
  name: "cd",
  execute: ({ args: o, fs: e, env: t }) => {
    const r = o[0] || "~", s = e.changeDirectory(r);
    return s.isFailure ? `cd: ${s.getError()}` : r === "-" ? S.getAbsolutePath(e.getCurrentDirectory()) : (t.set("PWD", S.getAbsolutePath(e.getCurrentDirectory())), "");
  }
}, Q = {
  name: "chmod",
  // description: 'Cambia los permisos de acceso a ficheros o directorios',
  execute: async ({ args: o, fs: e, env: t }) => {
    if (o.length < 2) return "usage: chmod <mode> <file>";
    const r = o[0], s = o[1], n = e.resolvePath(s);
    if (!n) return `chmod: cannot access '${s}': No such file or directory`;
    const i = t.get("USER");
    if (i !== "root" && n.owner !== i)
      return `chmod: changing permissions of '${s}': Operation not permitted`;
    try {
      let a;
      return /^[0-7]{3}$/.test(r) ? a = X(r) : a = Z(n.permissions, r), n.permissions = a, "";
    } catch {
      return `chmod: invalid mode: '${r}'`;
    }
  }
};
function X(o) {
  const e = o.split("").map(Number), t = (r) => ({
    read: !!(r & 4),
    write: !!(r & 2),
    execute: !!(r & 1)
  });
  return {
    user: t(e[0]),
    group: t(e[1]),
    others: t(e[2])
  };
}
function Z(o, e) {
  const t = JSON.parse(JSON.stringify(o)), r = e.match(/^([ugoa]*)([+\-=])([rwx]*)$/);
  if (!r) throw new Error();
  const [, s, n, i] = r, a = s === "" || s.includes("a") ? ["user", "group", "others"] : [];
  s.includes("u") && a.push("user"), s.includes("g") && a.push("group"), s.includes("o") && a.push("others");
  const c = [];
  return i.includes("r") && c.push("read"), i.includes("w") && c.push("write"), i.includes("x") && c.push("execute"), a.forEach((u) => {
    c.forEach((l) => {
      n === "+" && (t[u][l] = !0), n === "-" && (t[u][l] = !1), n === "=" && (t[u].read = i.includes("r"), t[u].write = i.includes("w"), t[u].execute = i.includes("x"));
    });
  }), t;
}
const V = {
  name: "ls",
  execute: ({ args: o, hasFlag: e, fs: t }) => {
    const r = o.length ? o : ["."], s = [], n = r.reduce((c, u) => {
      const l = t.resolvePath(u);
      return c + ((l == null ? void 0 : l.type) === "dir" ? 1 : 0);
    }, 0), i = n > 1 || n > 0 && r.length > 1;
    for (const c of r) {
      const u = t.getNodes(c, e("-a"));
      if (u.isFailure)
        return `ls: ${u.getError()}`;
      const l = u.getValue();
      e("-S") ? l.sort((d, g) => {
        var f, w;
        return (((f = g.content) == null ? void 0 : f.length) || 0) - (((w = d.content) == null ? void 0 : w.length) || 0);
      }) : e("-r") && l.reverse();
      let h;
      e("-l") ? h = l.map((d) => {
        var N;
        const f = (d.type === "dir" ? "d" : "-") + D(d.permissions.user) + D(d.permissions.group) + D(d.permissions.others), w = d.owner.padEnd(10), b = (d.group || d.owner).padEnd(10), v = d.type === "dir" ? 4096 : ((N = d.content) == null ? void 0 : N.length) || 0, x = e("-h") ? ee(v) : v.toString(), U = new Date(d.createdAt).toLocaleDateString("es-ES", {
          month: "short",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit"
        }), E = C(d, e("-F"));
        return `${f}  1 ${w} ${b} ${x.padStart(8)} ${U} ${E}`;
      }).join(`
`) : h = l.map((d) => C(d, e("-F"))).join(e("-1") ? `
` : "  "), i ? s.push(`${c}:`, h) : s.push(h);
    }
    const a = e("-1") ? `
` : i ? `

` : "  ";
    return s.join(a);
  }
};
function D(o) {
  return [
    o.read ? "r" : "-",
    o.write ? "w" : "-",
    o.execute ? "x" : "-"
  ].join("");
}
function ee(o) {
  if (o < 1024) return `${o}B`;
  const e = ["K", "M", "G"];
  let t = -1, r = o;
  for (; r >= 1024 && t < e.length - 1; )
    r /= 1024, t++;
  return `${r.toFixed(1)}${e[t]}`;
}
function C(o, e) {
  return o.type === "dir" ? `${o.name}/` : e && o.permissions.execute ? `${o.name}*` : o.name;
}
const te = {
  name: "mkdir",
  execute: ({ args: o, fs: e }) => {
    if (o.length < 1) return "mkdir: missing operand";
    const t = e.mkdir(o[0]);
    return t.isFailure ? `mkdir: ${t.getError()}` : "";
  }
}, re = {
  name: "pwd",
  execute: ({ fs: o }) => S.getAbsolutePath(o.getCurrentDirectory())
}, se = {
  name: "touch",
  execute: ({ args: o, fs: e }) => {
    if (o.length < 1) return "touch: missing file operand";
    const t = o[0], r = o[1] || "", s = e.touch(t, r);
    return s.isFailure ? `touch: ${s.getError()}` : "";
  }
}, ne = {
  name: "file",
  execute: ({ args: o, fs: e }) => {
    if (o.length < 1) return "file: missing file operand";
    const t = o[0], r = e.resolvePath(t);
    if (!r) return `file: ${t}: No such file or directory`;
    const s = e.getType(r);
    return s.isFailure ? `file: ${s.getError()}` : s.getValue() === "dir" ? `${t}: directory` : `${t}: regular file`;
  }
}, ie = {
  name: "rm",
  execute: ({ args: o, hasFlag: e, fs: t }) => {
    if (o.length < 1)
      return "rm: missing operand";
    const r = e("-r") || e("-R"), s = e("-f"), n = [];
    for (const i of o) {
      const a = t.remove(i, r);
      if (a.isFailure) {
        if (s && /not found|No such file or directory/i.test(a.getError()))
          continue;
        n.push(`rm: cannot remove '${i}': ${a.getError()}`);
      }
    }
    return n.length > 0 ? n.join(`
`) : "";
  }
}, oe = {
  name: "rmdir",
  execute: ({ args: o, fs: e }) => {
    if (o.length < 1)
      return "rmdir: missing operand";
    const t = [];
    for (const r of o) {
      const s = e.removeDirectory(r);
      s.isFailure && t.push(`rmdir: ${s.getError()}`);
    }
    return t.length > 0 ? t.join(`
`) : "";
  }
}, ae = {
  name: "cp",
  execute: ({ args: o, hasFlag: e, fs: t }) => {
    if (o.length < 2)
      return o.length === 1 ? `cp: missing destination file operand after '${o[0]}'` : "cp: missing file operand";
    const r = o[0], s = o[1], n = e("-r") || e("-R") || e("--recursive"), i = t.copy(r, s, n);
    return i.isFailure ? i.getError() : "";
  }
}, ce = {
  name: "mv",
  execute: ({ args: o, fs: e }) => {
    if (o.length < 2)
      return o.length === 1 ? `mv: missing destination file operand after '${o[0]}'` : "mv: missing file operand";
    const t = o[0], r = o[1], s = e.move(t, r);
    return s.isFailure ? s.getError() : "";
  }
}, ue = [
  J,
  Q,
  V,
  te,
  re,
  se,
  ne,
  ie,
  oe,
  ae,
  ce
], le = {
  name: "cat",
  execute: ({ args: o, fs: e, hasFlag: t }) => {
    if (o.length < 1) return "cat: missing file operand";
    const r = [];
    for (const n of o) {
      const i = e.cat(n);
      if (i.isFailure) {
        r.push(`cat: ${n}: ${i.getError()}`);
        continue;
      }
      r.push(i.getValue());
    }
    const s = r.join(`
`);
    return t("-n") ? s.split(`
`).map((n, i) => `${(i + 1).toString().padStart(6)}  ${n}`).join(`
`) : s;
  }
}, he = {
  name: "cmp",
  valuedFlags: [],
  execute: async ({ args: o, fs: e }) => {
    if (o.length < 2)
      return "cmp: usage: cmp file1 file2";
    const t = o[0].trim(), r = o[1].trim(), s = e.getRoot(), n = e.getCurrentDirectory(), i = S.resolve(t, n, s);
    if (!i || i.type !== "file")
      return `cmp: ${t}: No such file or directory`;
    const a = S.resolve(r, n, s);
    if (!a || a.type !== "file")
      return `cmp: ${r}: No such file or directory`;
    const c = i.content || "", u = a.content || "";
    if (c === u)
      return "";
    const l = Math.min(c.length, u.length);
    let h = 1, d = 1;
    for (let g = 0; g < l; g++) {
      const f = c[g], w = u[g];
      if (f !== w)
        return `${t} ${r} differ: byte ${d}, line ${h}`;
      f === `
` && h++, d++;
    }
    return c.length > u.length ? `cmp: EOF on ${r} after byte ${d - 1}, line ${h}` : `cmp: EOF on ${t} after byte ${d - 1}, line ${h}`;
  }
}, de = {
  name: "diff",
  valuedFlags: [],
  execute: async ({ args: o, fs: e }) => {
    if (o.length < 2)
      return "diff: usage: diff file1 file2";
    const t = o[0].trim(), r = o[1].trim(), s = e.getRoot(), n = e.getCurrentDirectory(), i = S.resolve(t, n, s);
    if (!i || i.type !== "file")
      return `diff: ${t}: No such file or directory`;
    const a = S.resolve(r, n, s);
    if (!a || a.type !== "file")
      return `diff: ${r}: No such file or directory`;
    const c = (i.content || "").split(`
`), u = (a.content || "").split(`
`);
    if (i.content === a.content)
      return "";
    const l = [], h = Math.max(c.length, u.length);
    let d = 0;
    for (; d < h; ) {
      const g = c[d], f = u[d];
      g !== void 0 && f !== void 0 && g !== f ? (l.push(`${d + 1}c${d + 1}`), l.push(`< ${g}`), l.push("---"), l.push(`> ${f}`)) : g !== void 0 && f === void 0 ? (l.push(`${d + 1}d${u.length}`), l.push(`< ${g}`)) : g === void 0 && f !== void 0 && (l.push(`${c.length}a${d + 1}`), l.push(`> ${f}`)), d++;
    }
    return l.join(`
`);
  }
}, me = {
  name: "grep",
  execute: ({ args: o, hasFlag: e, fs: t, pipeInput: r }) => {
    const s = o[0], n = o[1];
    if (!s) return "usage: grep [pattern] [file]";
    let i = "";
    if (r)
      i = r;
    else if (n) {
      const d = t.cat(n);
      if (d.isFailure)
        return `grep: ${d.getError()}`;
      i = d.getValue();
    } else
      return "grep: missing input";
    const a = e("-i"), c = e("-v"), u = e("-c");
    let l;
    try {
      l = new RegExp(s, a ? "i" : "");
    } catch {
      return `grep: invalid regular expression: ${s}`;
    }
    const h = i.split(`
`).filter((d) => {
      const g = l.test(d);
      return c ? !g : g;
    });
    return u ? h.length.toString() : h.join(`
`);
  }
}, pe = {
  name: "wc",
  // No añadimos valuedFlags porque -l, -w y -c son booleanas, no esperan un parámetro.
  execute: async ({ args: o, hasFlag: e, fs: t, pipeInput: r }) => {
    const s = o[0] ? o[0].trim() : "";
    let n = "";
    if (r)
      n = r;
    else {
      if (!s) return "wc: missing file operand";
      const f = t.resolvePath(s);
      if (!f || f.type !== "file")
        return `wc: ${s}: No such file or directory`;
      n = f.content || "";
    }
    const i = n === "" ? 0 : n.split(`
`).length, a = n.trim() === "" ? 0 : n.trim().split(/\s+/).length, c = n.length, u = e("l"), l = e("w"), h = e("c") || e("m"), d = !u && !l && !h, g = [];
    return (u || d) && g.push(i.toString()), (l || d) && g.push(a.toString()), (h || d) && g.push(c.toString()), !r && s && g.push(s), g.join("	");
  }
}, fe = {
  name: "head",
  valuedFlags: ["n"],
  execute: async ({ args: o, flagValues: e, fs: t, pipeInput: r }) => {
    let s = 10;
    if (e && e["-n"]) {
      const c = parseInt(e["-n"]);
      !isNaN(c) && c > 0 && (s = c);
    }
    const n = o[0] ? o[0].trim() : "";
    let i = "";
    if (r)
      i = r;
    else {
      if (!n) return "head: missing file operand";
      const c = t.resolvePath(n);
      if (!c || c.type !== "file")
        return `head: cannot open '${n}' for reading: No such file or directory`;
      i = c.content || "";
    }
    return i.split(`
`).slice(0, s).join(`
`);
  }
}, ge = {
  name: "tail",
  valuedFlags: ["n"],
  execute: async ({ args: o, flagValues: e, fs: t, pipeInput: r }) => {
    let s = 10;
    if (e && e["-n"]) {
      const c = parseInt(e["-n"]);
      !isNaN(c) && c > 0 && (s = c);
    }
    const n = o[0] ? o[0].trim() : "";
    let i = "";
    if (r)
      i = r;
    else {
      if (!n) return "tail: missing file operand";
      const c = t.resolvePath(n);
      if (!c || c.type !== "file")
        return `tail: cannot open '${n}' for reading: No such file or directory`;
      i = c.content || "";
    }
    const a = i.split(`
`);
    return a.length > 1 && a[a.length - 1] === "" && a.pop(), a.slice(-s).join(`
`);
  }
}, ye = {
  name: "cut",
  valuedFlags: ["d", "f"],
  // Registramos 'd' (delimiter) y 'f' (fields)
  execute: async ({ args: o, flagValues: e, fs: t, pipeInput: r }) => {
    let s = "	";
    e && e["-d"] && (s = e["-d"]);
    let n = 1;
    if (e && e["-f"]) {
      const l = parseInt(e["-f"]);
      if (!isNaN(l) && l > 0)
        n = l;
      else
        return "cut: fields are numbered from 1";
    }
    const i = o[0] ? o[0].trim() : "";
    let a = "";
    if (r)
      a = r;
    else {
      if (!i) return "cut: missing file operand";
      const l = t.resolvePath(i);
      if (!l || l.type !== "file")
        return `cut: ${i}: No such file or directory`;
      a = l.content || "";
    }
    return a.split(`
`).map((l) => {
      if (l === "") return "";
      if (!l.includes(s)) return l;
      const h = l.split(s);
      return h[n - 1] !== void 0 ? h[n - 1] : "";
    }).join(`
`);
  }
}, Se = {
  name: "sort",
  execute: async ({ args: o, hasFlag: e, fs: t, pipeInput: r }) => {
    const s = o[0] ? o[0].trim() : "";
    let n = "";
    if (r)
      n = r;
    else {
      if (!s) return "sort: missing file operand";
      const a = t.resolvePath(s);
      if (!a || a.type !== "file")
        return `sort: ${s}: No such file or directory`;
      n = a.content || "";
    }
    const i = n.split(`
`);
    return i.length > 1 && i[i.length - 1] === "" && i.pop(), i.sort((a, c) => a.localeCompare(c)), e("r") && i.reverse(), i.join(`
`);
  }
}, we = {
  name: "uniq",
  execute: async ({ args: o, hasFlag: e, fs: t, pipeInput: r }) => {
    const s = o[0] ? o[0].trim() : "";
    let n = "";
    if (r)
      n = r;
    else {
      if (!s) return "uniq: missing file operand";
      const h = t.resolvePath(s);
      if (!h || h.type !== "file")
        return `uniq: ${s}: No such file or directory`;
      n = h.content || "";
    }
    const i = n.split(`
`);
    if (i.length > 1 && i[i.length - 1] === "" && i.pop(), i.length === 0) return "";
    const a = e("c"), c = [];
    let u = i[0], l = 1;
    for (let h = 1; h < i.length; h++)
      i[h] === u ? l++ : (a ? c.push(`  ${l} ${u}`) : c.push(u), u = i[h], l = 1);
    return a ? c.push(`  ${l} ${u}`) : c.push(u), c.join(`
`);
  }
}, ve = [
  le,
  me,
  he,
  de,
  fe,
  ge,
  pe,
  ye,
  Se,
  we
], Ee = {
  name: "echo",
  execute: ({ args: o, env: e }) => o.map((t) => {
    if (t.startsWith("$")) {
      const r = t.substring(1);
      return e.get(r) || "";
    }
    return t;
  }).join(" ")
}, $e = {
  name: "whoami",
  execute: ({ env: o }) => o.get("USER") || "unknown"
}, xe = {
  name: "clear",
  execute: () => "COMMAND_CLEAR"
}, Ne = {
  name: "help",
  execute: async ({ args: o }) => `Comandos disponibles: ${M.map((e) => e.name).join(", ")}`
}, be = {
  name: "env",
  execute: ({ env: o }) => {
    const e = o.getAll();
    return Object.entries(e).map(([t, r]) => `${t}=${r}`).join(`
`);
  }
}, Ue = {
  name: "history",
  execute: ({ kernel: o, hasFlag: e }) => {
    const t = o.getHistory();
    if (e("-c"))
      return o.clearHistory(), "";
    if (e("-e") || e("--export")) {
      const r = t.join(`
`), s = new Blob([r], { type: "text/plain" }), n = URL.createObjectURL(s), i = document.createElement("a");
      return i.href = n, i.download = "bash_history.txt", i.click(), URL.revokeObjectURL(n), "Historial extraído y descargado como bash_history.txt";
    }
    return t.map((r, s) => `${(s + 1).toString().padStart(5)}  ${r}`).join(`
`);
  }
}, Ae = {
  name: "sudo",
  execute: async ({ args: o, kernel: e, env: t, userManager: r, flagValues: s, ...n }) => {
    if (o.length === 0) return "usage: sudo <command> [arguments]";
    const i = t.get("USER") || "guest", c = r.getGroups().find((f) => f.groupName === "sudo" || f.groupName === "wheel"), u = c == null ? void 0 : c.members.includes(i);
    if (i !== "root" && !u)
      return `Sorry, user ${i} is not allowed to execute sudo. This incident will be reported.`;
    let l = s["--sudo-pass"] || s["sudo-pass"] || null;
    if (!l && n.rawInput) {
      const f = n.rawInput.match(/--sudo-pass=(\S+)/);
      f && (l = f[1]);
    }
    if (i !== "root" && !l)
      return `AUTH_REQUIRED:sudo:${i}`;
    if (i !== "root" && l) {
      const f = r.getUserByName(i), w = r.hashPassword(l);
      if (!f || w !== f.password)
        return "sudo: 1 incorrect password attempt";
    }
    const d = o.filter((f) => !f.startsWith("--sudo-pass=")).join(" "), g = i;
    try {
      return t.set("USER", "root"), t.set("SUDO_USER", g), await e.execute(d, !0);
    } catch (f) {
      return `sudo: error executing command: ${f.message}`;
    } finally {
      t.set("USER", g), t.set("SUDO_USER", "");
    }
  }
}, De = {
  name: "date",
  // description: 'Muestra la fecha y hora del sistema',
  execute: async ({ args: o, hasFlag: e }) => {
    const t = /* @__PURE__ */ new Date();
    if (e("-u") || e("--utc"))
      return t.toUTCString();
    const r = o.find((a) => a.startsWith("+"));
    if (r)
      return Pe(t, r.slice(1));
    const s = {
      weekday: "short",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: !1,
      timeZoneName: "short"
    }, n = t.toLocaleString("es-ES", s).replace(/,/g, ""), i = t.getFullYear();
    return `${n} ${i}`;
  }
};
function Pe(o, e) {
  const t = {
    "%Y": o.getFullYear(),
    "%m": (o.getMonth() + 1).toString().padStart(2, "0"),
    "%d": o.getDate().toString().padStart(2, "0"),
    "%H": o.getHours().toString().padStart(2, "0"),
    "%M": o.getMinutes().toString().padStart(2, "0"),
    "%S": o.getSeconds().toString().padStart(2, "0")
  };
  let r = e;
  for (const s in t)
    r = r.replace(new RegExp(s, "g"), t[s]);
  return r;
}
const Te = {
  name: "uptime",
  // description: 'Muestra cuánto tiempo lleva el sistema encendido',
  execute: async ({ kernel: o, userManager: e }) => {
    const r = (/* @__PURE__ */ new Date()).toLocaleTimeString("es-ES", { hour12: !1 }), s = o.getUptime(), n = Math.floor(s / 1e3), i = Math.floor(n / 60), a = Math.floor(i / 60), c = Math.floor(a / 24);
    let u = "";
    c > 0 && (u += `${c} day${c > 1 ? "s" : ""}, `), a > 0 && (u += `${a % 24} hour${a % 24 > 1 ? "s" : ""}, `), u += `${i % 60} min${i % 60 > 1 ? "s" : ""}`;
    const l = e.getUsers().length;
    return ` ${r} up ${u},  ${l} users,  load average: 0.05, 0.03, 0.01`;
  }
}, Ie = {
  name: "who",
  // description: 'Muestra quién está conectado',
  execute: async ({ env: o, kernel: e }) => {
    const t = o.get("USER") || "guest", r = o.get("HOSTNAME") || "js-terminal", s = new Date(Date.now() - e.getUptime()), n = s.toLocaleString("es-ES", { month: "short" }), i = s.getDate(), a = s.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", hour12: !1 });
    return `${t.padEnd(10)} pts/0        ${n} ${i} ${a} (${r})`;
  }
}, Oe = {
  name: "w",
  // description: 'Muestra quién está conectado',
  execute: async ({ env: o, kernel: e }) => {
    const t = o.get("USER") || "guest", r = o.get("HOSTNAME") || "js-terminal", s = new Date(Date.now() - e.getUptime()), n = s.toLocaleString("es-ES", { month: "short" }), i = s.getDate(), a = s.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", hour12: !1 });
    return `${t.padEnd(10)} pts/0        ${n} ${i} ${a} (${r})`;
  }
}, Re = {
  name: "chown",
  // description: 'Cambia el propietario y el grupo de un archivo o directorio',
  execute: async ({ args: o, fs: e, env: t, userManager: r }) => {
    if (t.get("USER") !== "root")
      return "chown: changing ownership: Operation not permitted";
    if (o.length < 2)
      return "usage: chown [OWNER][:[GROUP]] FILE...";
    const s = o[0], n = o[1], [i, a] = s.split(":");
    return i && !r.getUserByName(i) ? `chown: invalid user: '${i}'` : a && !r.getGroups().find((u) => u.groupName === a) ? `chown: invalid group: '${a}'` : e.setOwnership(n, "root", [], i, a).isSuccess ? "" : `chown: cannot access '${n}': No such file or directory`;
  }
}, Ce = {
  name: "cal",
  execute: ({ args: o }) => {
    const e = /* @__PURE__ */ new Date();
    let t = e.getMonth(), r = e.getFullYear();
    if (o.length === 1) {
      const h = parseInt(o[0], 10);
      if (isNaN(h) || h < 1 || h > 9999)
        return "cal: illegal year value: use 1-9999";
      r = h;
    } else if (o.length >= 2) {
      const h = parseInt(o[0], 10), d = parseInt(o[1], 10);
      if (isNaN(h) || h < 1 || h > 12)
        return `cal: ${o[0]} is not a valid month (1-12)`;
      if (isNaN(d) || d < 1 || d > 9999)
        return "cal: illegal year value: use 1-9999";
      t = h - 1, r = d;
    }
    const s = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December"
    ], n = new Date(r, t, 1).getDay(), i = new Date(r, t + 1, 0).getDate(), a = [], c = `${s[t]} ${r}`, u = Math.max(0, Math.floor((20 - c.length) / 2));
    a.push(" ".repeat(u) + c), a.push("Su Mo Tu We Th Fr Sa");
    let l = "   ".repeat(n);
    for (let h = 1; h <= i; h++) {
      const d = h.toString().padStart(2, " ");
      l += d + " ", ((n + h) % 7 === 0 || h === i) && (a.push(l.trimEnd()), l = "");
    }
    return a.join(`
`);
  }
}, Me = {
  name: "chgrp",
  execute: async ({ args: o, fs: e, env: t, userManager: r }) => {
    if (o.length < 2)
      return "usage: chgrp GROUP FILE...";
    const s = o[0], n = o[1], i = t.get("USER") || "guest", a = r.getGroups().find((u) => u.groupName === s);
    if (!a)
      return `chgrp: invalid group: '${s}'`;
    const c = e.setOwnership(
      n,
      i,
      a.members,
      void 0,
      // No alteramos el dueño (owner)
      s
      // Cambiamos el grupo
    );
    return c.isFailure ? `chgrp: ${c.getError()}` : "";
  }
}, ke = {
  name: "alias",
  valuedFlags: [],
  execute: async ({ args: o, rawArgs: e, env: t, rawInput: r }) => {
    if (o.length === 0) {
      const c = t.getAliases();
      return c.length === 0 ? "" : c.map(([u, l]) => `alias ${u}='${l}'`).join(`
`);
    }
    const s = r == null ? void 0 : r.indexOf("=");
    if (s === -1) {
      const c = o[0].trim(), u = t.getAlias(c);
      return u ? `alias ${c}='${u}'` : `shell: alias: ${c}: not found`;
    }
    const n = r == null ? void 0 : r.substring(0, s).trim(), i = n == null ? void 0 : n.replace(/^alias\s+/, "").trim();
    let a = r == null ? void 0 : r.substring(s ? s + 1 : 0).trim();
    return (a != null && a.startsWith("'") && (a != null && a.endsWith("'")) || a != null && a.startsWith('"') && (a != null && a.endsWith('"'))) && (a = a == null ? void 0 : a.substring(1, a.length - 1)), i === "" ? "alias: invalid alias name" : (t.setAlias(i, a), "");
  }
}, Fe = {
  name: "unalias",
  valuedFlags: [],
  execute: async ({ args: o, env: e }) => {
    if (o.length < 1)
      return "unalias: usage: unalias name [name ...]";
    for (const t of o)
      if (!e.removeAlias(t.trim()))
        return `unalias: ${t}: not found`;
    return "";
  }
}, Ge = [
  Ae,
  xe,
  Ee,
  be,
  Ne,
  $e,
  Ue,
  De,
  Te,
  Ie,
  Oe,
  Re,
  Ce,
  Me,
  ke,
  Fe
], Le = {
  name: "groups",
  // description: 'Muestra los grupos a los que pertenece un usuario',
  execute: async ({ args: o, userManager: e, env: t }) => {
    const r = o[0] || t.get("USER"), n = e.getGroups().filter((i) => i.groupName === r || i.members.includes(r)).map((i) => i.groupName);
    return n.length === 0 ? `${r} : no groups found` : `${r} : ${n.join(" ")}`;
  }
}, _e = {
  name: "adduser",
  // description: 'Añade un usuario al sistema o añade un usuario a un grupo',
  execute: async ({ args: o, userManager: e, env: t }) => {
    if (t.get("USER") !== "root") return "adduser: Only root can do that";
    if (o.length === 2) {
      const [r, s] = o, n = e.addUserToGroup(r, s);
      return n || `Adding user '${r}' to group '${s}'... Done.`;
    }
    return o.length === 1 ? "Use 'useradd' to create new users or 'adduser user group' to link them." : "Usage: adduser USER GROUP";
  }
}, je = {
  name: "addgroup",
  // description: 'Añade un nuevo grupo al sistema',
  valuedFlags: ["g"],
  // -g para especificar un GID manual si se desea
  execute: async ({ args: o, flagValues: e, userManager: t, env: r }) => {
    if (r.get("USER") !== "root")
      return "addgroup: Only root can do that";
    if (o.length < 1)
      return `addgroup: Se requiere un nombre de grupo.
Uso: addgroup [OPCIONES] NOMBRE`;
    const s = o[0];
    let n;
    if (e["-g"]) {
      if (n = parseInt(e["-g"]), isNaN(n)) return "addgroup: el GID debe ser un número";
    } else {
      const a = t.getGroups();
      n = a.length > 0 ? Math.max(...a.map((c) => c.gid)) + 1 : 1e3;
    }
    const i = t.saveGroup({
      groupName: s,
      gid: n,
      members: []
      // Nuevo grupo nace sin miembros
    });
    return i || `Añadiendo el grupo '${s}' (GID ${n})... Hecho.`;
  }
}, We = {
  name: "su",
  execute: async ({ args: o, env: e, userManager: t }) => {
    const r = e.get("USER") || "guest", s = o[0] || "root", n = t.getUserByName(s);
    if (!n) return `su: user '${s}' does not exist`;
    if (r === "root")
      return e.set("USER", n.username), e.set("HOME", n.home), e.set("PWD", n.home), `Cambiando al usuario ${n.username}...`;
    if (!n.password || n.password.trim() === "" || n.password.startsWith("!"))
      return "su: Authentication failure (Account is locked. Use passwd to set a password first).";
    const i = o[1];
    return i ? t.hashPassword(i) !== n.password ? "su: Authentication failure" : (e.set("USER", n.username), e.set("HOME", n.home), e.set("PWD", n.home), `Cambiando al usuario ${n.username}...`) : `AUTH_REQUIRED:su:${s}`;
  }
}, He = {
  name: "useradd",
  valuedFlags: ["u", "s"],
  execute: async ({ args: o, flagValues: e, userManager: t, fs: r, env: s }) => {
    if (s.get("USER") !== "root")
      return "useradd: Only root can do that";
    if (o.length < 1)
      return "useradd: missing username";
    const n = o[0], i = t.getUsers();
    if (i.some((h) => h.username === n))
      return `useradd: user '${n}' already exists`;
    let a;
    if (e["-u"] || e["--u"]) {
      if (a = parseInt(e["-u"] || e["--u"]), isNaN(a)) return "useradd: invalid numeric argument for -u";
      if (i.some((h) => h.uid === a))
        return `useradd: UID ${a} already exists`;
    } else
      a = i.length > 0 ? Math.max(...i.map((h) => h.uid)) + 1 : 1e3;
    const c = {
      username: n,
      uid: a,
      gid: a,
      home: `/home/${n}`,
      shell: e["-s"] || e["--s"] || "/bin/bash",
      fullName: n,
      password: "!"
      // 🌟 Cuenta bloqueada por defecto hasta asignación manual
    }, u = t.saveUser(c);
    if (u) return u;
    const l = e["-s"] || e["--s"] ? ` with shell ${c.shell}` : "";
    return `useradd: user '${n}' added (UID: ${a})${l}
Notice: Account is locked until a password is set via 'passwd'.`;
  }
}, Be = {
  name: "deluser",
  // description: 'Elimina un usuario del sistema',
  execute: async ({ args: o, userManager: e, env: t, fs: r }) => {
    if (t.get("USER") !== "root") return "deluser: Only root can do that";
    if (o.length === 0) return "deluser: enter a username";
    const s = o[0], n = t.get("USER"), i = t.get("SUDO_USER") || n;
    if (s === i)
      return `deluser: The user '${s}' is currently logged in and cannot be deleted.`;
    const a = e.deleteUser(s);
    return a || `Removing user '${s}'... Done.`;
  }
}, Ye = {
  name: "delgroup",
  // description: 'Elimina un grupo del sistema',
  execute: async ({ args: o, userManager: e, env: t }) => {
    if (t.get("USER") !== "root") return "delgroup: Only root can do that";
    if (o.length === 0) return "delgroup: enter a group name";
    const r = o[0], s = e.deleteGroup(r);
    return s || `Removing group '${r}'... Done.`;
  }
}, qe = {
  name: "finger",
  execute: async ({ args: o, fs: e }) => {
    const t = e.resolvePath("/etc/passwd");
    if (!t || t.type !== "file")
      return "finger: cannot read system user database";
    const s = (t.content || "").split(`
`).filter((i) => i.trim() !== "");
    if (o.length > 0) {
      const i = o[0].trim().toLowerCase(), a = s.find((f) => f.startsWith(`${i}:`));
      if (!a) return `finger: ${i}: no such user`;
      const c = a.split(":"), u = c[0], l = c[2], h = c[4] || u, d = c[5], g = c[6];
      return [
        `Login: ${u}				Name: ${h}`,
        `Directory: ${d}			Shell: ${g}`,
        `UID: ${l}				Status: Active`,
        "Project: No profile project file specified."
      ].join(`
`);
    }
    const n = ["Login		Name		TTY	Idle	Login Time"];
    return s.forEach((i) => {
      const a = i.split(":");
      if (a.length >= 6) {
        const c = a[0], u = a[4] || a[0];
        n.push(`${c.padEnd(12)}${u.padEnd(16)}pts/0	*	May 17 20:26`);
      }
    }), n.join(`
`);
  }
}, Ke = {
  name: "passwd",
  execute: async ({ args: o, userManager: e, env: t, fs: r }) => {
    const s = t.get("USER") || "guest";
    let n = o[0] ? o[0].trim() : s;
    if (n === "guest")
      return "passwd: You cannot change the password for 'guest'";
    if (s !== "root" && s !== n)
      return "passwd: Permission denied (You are not root)";
    let i = o[1] ? o[1].trim() : "";
    if (!i && o[0] && n === s && (i = o[0].trim(), n = s), !i || i === n)
      return `Usage: passwd [username] [new_password]
(Note: password cannot be empty)`;
    const a = r.resolvePath("/etc/passwd");
    if (!a || a.type !== "file")
      return "passwd: User database (/etc/passwd) not found";
    if (!(a.content || "").split(`
`).some((h) => h.startsWith(`${n}:`)))
      return `passwd: user '${n}' does not exist`;
    const l = e.updatePassword(n, i);
    return l || `passwd: password updated successfully for user '${n}'`;
  }
}, ze = [
  We,
  He,
  Le,
  _e,
  je,
  Be,
  Ye,
  qe,
  Ke
], Je = {
  name: "save",
  execute: ({ kernel: o }) => {
    try {
      const e = o.exportFullSystemState(), t = JSON.stringify(e, null, 2), r = new Blob([t], { type: "application/json" }), s = URL.createObjectURL(r), n = document.createElement("a");
      return n.href = s, n.download = "system_init.json", document.body.appendChild(n), n.click(), document.body.removeChild(n), URL.revokeObjectURL(s), "Estado completo del sistema (FS, Users, History) exportado.";
    } catch (e) {
      return "Error al exportar: " + e;
    }
  }
}, Qe = {
  name: "easteregg",
  execute: () => "Esto es un Easter Egg."
}, Xe = [
  Je,
  Qe
], M = [
  ...Ge,
  ...ue,
  ...ve,
  ...ze,
  ...Xe
];
class Ze {
  constructor() {
    m(this, "commands", /* @__PURE__ */ new Map());
    this.loadCommands();
  }
  loadCommands() {
    M.forEach((e) => {
      this.commands.set(e.name, e), e.alias && e.alias.forEach((t) => this.commands.set(t, e));
    });
  }
  getCommand(e) {
    return this.commands.get(e.toLowerCase());
  }
  resolveCommandName(e) {
    const t = this.getCommand(e);
    return t ? t.name : null;
  }
  getAllCommands() {
    return this.commands;
  }
  getCommandNames() {
    return Array.from(new Set(Array.from(this.commands.values()).map((e) => e.name)));
  }
}
class Ve {
  constructor(e) {
    m(this, "key", "fileSystem");
    this.fs = e;
  }
  /**
   * EXPORTACIÓN: Transforma el árbol de INodes en un objeto JSON.
   */
  getState() {
    const e = this.fs.getRoot(), t = (r) => {
      const s = {
        name: r.name,
        type: r.type,
        owner: r.owner,
        group: r.group,
        permissions: r.permissions,
        content: r.content,
        createdAt: r.createdAt,
        children: []
      };
      return r.children && Array.isArray(r.children) && (s.children = r.children.map((n) => t(n))), s;
    };
    return t(e);
  }
  /**
   * Carga el FileSystem a partir del trozo de JSON correspondiente
   */
  loadState(e) {
    if (!e) {
      this.fs.loadDefaults();
      return;
    }
    const t = this.reconstructTree(e, null);
    this.fs.setRoot(t), this.fs.setCurrentDirectory(t);
  }
  /**
   * Reconstruye el árbol desde el JSON de forma recursiva asegurando hidratar la referencia 'parent'
   */
  reconstructTree(e, t = null) {
    const r = {
      name: e.name,
      type: e.type,
      owner: e.owner || "root",
      group: e.group || e.owner || "root",
      permissions: e.permissions || {
        user: { read: !0, write: !0, execute: e.type === "dir" },
        group: { read: !0, write: !1, execute: !1 },
        others: { read: !0, write: !1, execute: !1 }
      },
      content: e.content || "",
      createdAt: e.createdAt || Date.now(),
      parent: t,
      children: []
    };
    return e.children && Array.isArray(e.children) && (r.children = e.children.map(
      (s) => this.reconstructTree(s, r)
    )), r;
  }
}
class et {
  constructor(e) {
    m(this, "key", "env");
    this.env = e;
  }
  /**
   * Devuelve una copia de todas las variables actuales.
   * Fundamental para el comando 'env' y para la exportación a JSON.
   */
  getState() {
    return this.env.getAll();
  }
  /**
   * Permite cargar múltiples variables a la vez (ej: desde un JSON).
   */
  loadState(e) {
    for (const [t, r] of Object.entries(e))
      this.env.set(t, String(r));
  }
}
class tt {
  constructor(e) {
    m(this, "key", "groups");
    this.userManager = e;
  }
  getState() {
    return this.userManager.getGroups();
  }
  loadState(e) {
    this.userManager.saveGroup(e);
  }
}
class rt {
  constructor(e) {
    m(this, "key", "users");
    this.userManager = e;
  }
  getState() {
    return this.userManager.getUsers();
  }
  loadState(e) {
    this.userManager.saveUser(e);
  }
}
class st {
  // El historial sí puede ser nativo del Kernel si se maneja aquí
  constructor(e, t = "/public/vms/default.json") {
    m(this, "savers", /* @__PURE__ */ new Map());
    m(this, "history", []);
    this.configUrl = t, e.forEach((r) => this.savers.set(r.key, r));
  }
  async loadData() {
    try {
      const e = await fetch(this.configUrl);
      if (!e.ok) throw new Error();
      const t = await e.json();
      for (const [r, s] of this.savers.entries())
        t[r] && s.loadState(t[r]);
      t.history && (this.history = t.history);
    } catch {
      console.warn("Storage: Error loading configuration, applying generic defaults.");
    }
  }
  // NO FUNCIONA, devuelve el json vacio. Ademas, no se como coger users y GROUPS en el bucle
  async saveData() {
    const e = {};
    for (const [t, r] of this.savers.entries())
      e[t] = r.getState();
    return e.history = this.history, e;
  }
  // Métodos para que el Kernel acceda a su propio historial sin inyectar la clase Kernel
  getHistory() {
    return this.history;
  }
  loadHistory(e) {
    this.history = e;
  }
}
class nt {
  constructor(e, t = "/vms/default.json") {
    m(this, "envStateImpl");
    m(this, "fsStateImpl");
    m(this, "userStateImpl");
    m(this, "groupStateImpl");
    m(this, "jsonStorageImpl");
    this.envStateImpl = new et(e.environment), this.fsStateImpl = new Ve(e.fileSystem), this.userStateImpl = new rt(e.userManager), this.groupStateImpl = new tt(e.userManager);
    const r = [
      this.envStateImpl,
      this.fsStateImpl,
      this.userStateImpl,
      this.groupStateImpl
    ];
    this.jsonStorageImpl = new st(r, t);
  }
  async initSystem(e) {
    try {
      await this.jsonStorageImpl.loadData();
    } catch {
      console.warn("PersistenceManager: Error loading config, using defaults."), e.loadDefaults();
    }
  }
  async saveState() {
    await this.jsonStorageImpl.saveData();
  }
  exportFullSystemState(e) {
    return {
      env: this.envStateImpl.getState(),
      fileSystem: this.fsStateImpl.getState(),
      users: this.userStateImpl.getState(),
      groups: this.groupStateImpl.getState(),
      history: e
    };
  }
}
class it {
  constructor(e, t, r) {
    m(this, "fileSystem");
    m(this, "environment");
    m(this, "userManager");
    this.fileSystem = e, this.environment = t, this.userManager = r;
  }
  generatePromptText() {
    const e = this.environment.get("USER") || "guest", t = this.environment.get("HOSTNAME") || "js-terminal", r = S.getAbsolutePath(this.fileSystem.getCurrentDirectory());
    return `${e}@${t}:${r}$ `;
  }
  getCompletions(e) {
    const t = e.split(/\s+/), r = t[t.length - 1], s = r.lastIndexOf("/");
    let n = r, i = "", a;
    return s !== -1 ? (i = r.substring(0, s + 1), n = r.substring(s + 1), a = S.resolve(
      i,
      this.fileSystem.getCurrentDirectory(),
      this.fileSystem.getRoot()
    )) : a = this.fileSystem.getCurrentDirectory(), !a || a.type !== "dir" ? [] : a.children.filter((c) => c.name.startsWith(n)).map((c) => {
      const u = c.type === "dir" ? "/" : " ";
      return i + c.name + u;
    });
  }
  loadDefaults() {
    this.environment.loadDefaults(), this.fileSystem.loadDefaults(), this.userManager.loadDefaults();
  }
}
class ot {
  constructor(e = "/vms/default.json") {
    m(this, "startTime");
    m(this, "history", []);
    m(this, "isReady", !1);
    // NUEVOS ESTADOS PARA EL HIPERVISOR
    m(this, "powerState", "POWER_ON");
    m(this, "ipAddress", null);
    // Para la futura red
    m(this, "executor");
    m(this, "registry");
    m(this, "orchestrator");
    m(this, "persistence");
    this.startTime = Date.now();
    const t = new Y(), r = new B(t), s = new K(r), n = new q(r, s);
    this.orchestrator = new it(r, t, n), this.executor = new z(t), this.registry = new Ze(), this.persistence = new nt(this.orchestrator, e);
  }
  /**
   * APAGAR LA MÁQUINA (Simula un shutdown)
   */
  shutdown() {
    this.powerState = "POWER_OFF";
  }
  /**
   * ENCENDER LA MÁQUINA (Simula un power on)
   */
  powerOn() {
    this.powerState = "POWER_ON";
  }
  /**
   * Comprobar el estado de energía externo (útil para el ping del hipervisor)
   */
  getPowerState() {
    return this.powerState;
  }
  async boot() {
    this.isReady || (await this.persistence.initSystem(this.orchestrator), this.isReady = !0);
  }
  async execute(e, t = !1, r) {
    if (this.powerState === "POWER_OFF")
      return "SYSTEM_ERROR: Hardware is powered off. Cannot execute commands.";
    const s = e.trim();
    if (!s) return "";
    t || this.history.push(s);
    try {
      return await this.executor.execute(
        s,
        this.registry.getAllCommands(),
        this.orchestrator.fileSystem,
        this.orchestrator.userManager,
        this,
        r
      );
    } catch (n) {
      if ((n == null ? void 0 : n.name) === "AbortError")
        return "COMMAND_ABORTED";
      throw n;
    }
  }
  getPromptText() {
    return this.orchestrator.generatePromptText();
  }
  getCompletions(e) {
    const t = e.split(/\s+/), r = t[t.length - 1];
    return t.length === 1 && !e.endsWith(" ") ? Array.from(this.registry.getAllCommands().keys()).filter((s) => s.startsWith(r.toLowerCase())).map((s) => s + " ") : this.orchestrator.getCompletions(e);
  }
  getHistory() {
    return this.history;
  }
  clearHistory() {
    this.history = [];
  }
  getUptime() {
    return Date.now() - this.startTime;
  }
  exportFullSystemState() {
    return this.persistence.exportFullSystemState(this.history);
  }
}
class at {
  constructor(e, t, r) {
    m(this, "outputElement");
    m(this, "inputElement");
    m(this, "promptElement");
    m(this, "clickListener", null);
    this.outputElement = e, this.inputElement = t, this.promptElement = r, this.init();
  }
  init() {
    const e = this.outputElement.parentElement;
    e && (this.clickListener = () => {
      this.inputElement.disabled || this.inputElement.focus();
    }, e.addEventListener("click", this.clickListener));
  }
  /**
   * MÉTODO DE LIMPIEZA (Opcional pero recomendado para el hipervisor)
   * Si alguna vez necesitas destruir por completo esta UI visual, limpia su listener de clics.
   */
  destroy() {
    const e = this.outputElement.parentElement;
    e && this.clickListener && e.removeEventListener("click", this.clickListener);
  }
  /**
   * Imprime una línea en la terminal
   */
  print(e, t = "") {
    const r = document.createElement("div");
    t && r.classList.add(t), r.style.whiteSpace = "pre-wrap", r.style.wordBreak = "break-all", r.innerHTML = e || "&nbsp;", this.outputElement.appendChild(r), this.scrollToBottom();
  }
  /**
   * Copia lo que el usuario escribió al historial antes de procesarlo
   */
  copyInputToOutput(e) {
    const t = document.createElement("div");
    t.classList.add("history-line");
    const r = document.createElement("span");
    r.className = "prompt", r.innerText = this.promptElement.innerText + " ";
    const s = document.createElement("span");
    s.innerText = e, t.appendChild(r), t.appendChild(s), this.outputElement.appendChild(t), this.scrollToBottom();
  }
  /**
   * Actualiza el texto del prompt (ej: al cambiar de usuario o carpeta)
   */
  updatePrompt(e) {
    this.promptElement.innerText = e;
  }
  /**
   * Hace scroll automático hacia abajo
   */
  scrollToBottom() {
    const e = this.outputElement.parentElement;
    e && (e.scrollTop = e.scrollHeight);
  }
  /**
   * Limpia la pantalla (para el comando 'clear')
   */
  clear() {
    this.outputElement.innerHTML = "";
  }
  /**
   * Cambia el tipo de input (text o password) dinámicamente
   */
  setInputType(e) {
    this.inputElement.type = e;
  }
}
class ct {
  constructor() {
    m(this, "pendingAuth", null);
  }
  hasPendingAuth() {
    return this.pendingAuth !== null;
  }
  getPendingAuth() {
    return this.pendingAuth;
  }
  initiatePendingAuth(e, t) {
    this.pendingAuth = { type: e, originalLine: t };
  }
  clearPendingAuth() {
    this.pendingAuth = null;
  }
  getPromptText(e) {
    return this.pendingAuth && this.pendingAuth.type === "sudo" ? `[sudo] password for ${e || "root"}: ` : "Password: ";
  }
  buildAuthenticatedCommand(e) {
    if (!this.pendingAuth) return e;
    const t = this.pendingAuth.originalLine;
    if (this.pendingAuth.type === "sudo") {
      const r = t.replace(/^sudo\s+/, "");
      return `sudo --sudo-pass=${e} ${r}`;
    }
    return `${t} ${e}`;
  }
}
class ut {
  expand(e, t) {
    if (!e.startsWith("!") || e.length === 1) return null;
    const r = e.substring(1).trim();
    if (r === "!")
      return t.length > 0 ? t[t.length - 1] : null;
    if (/^\d+$/.test(r)) {
      const s = parseInt(r, 10) - 1;
      return s >= 0 && s < t.length ? t[s] : null;
    }
    for (let s = t.length - 1; s >= 0; s--)
      if (t[s].startsWith(r))
        return t[s];
    return null;
  }
}
class lt {
  constructor(e) {
    m(this, "currentIndex", -1);
    m(this, "history");
    this.history = e;
  }
  goUp() {
    return this.history.length === 0 ? "" : (this.currentIndex === -1 ? this.currentIndex = this.history.length - 1 : this.currentIndex > 0 && this.currentIndex--, this.history[this.currentIndex] || "");
  }
  goDown() {
    return this.currentIndex === -1 ? "" : this.currentIndex < this.history.length - 1 ? (this.currentIndex++, this.history[this.currentIndex] || "") : (this.currentIndex = -1, "");
  }
  reset() {
    this.currentIndex = -1;
  }
}
class ht {
  constructor(e, t, r, s, n) {
    m(this, "currentAbortController", null);
    // GUARDADO DE REFERENCIAS PARA EL HIPERVISOR
    m(this, "boundKeyDownListener", null);
    m(this, "attachedInputElement", null);
    this.kernel = e, this.terminal = t, this.authManager = r, this.historyExpander = s, this.historyNavigator = n;
  }
  attach(e) {
    this.attachedInputElement = e, this.boundKeyDownListener = async (t) => {
      await this.handleKeyDown(t, e);
    }, e.addEventListener("keydown", this.boundKeyDownListener);
  }
  /**
   * MÉTODO PARA EL HIPERVISOR
   * Desconecta los listeners del input de manera limpia sin alterar el Kernel.
   */
  detach() {
    this.attachedInputElement && this.boundKeyDownListener && this.attachedInputElement.removeEventListener("keydown", this.boundKeyDownListener), this.attachedInputElement = null, this.boundKeyDownListener = null, this.currentAbortController && (this.currentAbortController.abort(), this.currentAbortController = null);
  }
  async handleKeyDown(e, t) {
    if (this.kernel.getPowerState && this.kernel.getPowerState() === "POWER_OFF") {
      e.preventDefault();
      return;
    }
    if (e.ctrlKey && e.key.toLowerCase() === "c") {
      if (e.preventDefault(), this.currentAbortController && !this.currentAbortController.signal.aborted) {
        this.currentAbortController.abort(), this.currentAbortController = null, this.terminal.print("^C"), this.terminal.updatePrompt(this.kernel.getPromptText()), t.value = "";
        return;
      }
      t.value.length > 0 && (this.terminal.print("^C"), t.value = "");
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault(), await this.handleEnter(t);
      return;
    }
    if (e.key === "ArrowUp") {
      this.authManager.hasPendingAuth() || (e.preventDefault(), t.value = this.historyNavigator.goUp());
      return;
    }
    if (e.key === "ArrowDown") {
      this.authManager.hasPendingAuth() || (e.preventDefault(), t.value = this.historyNavigator.goDown());
      return;
    }
    if (e.key === "Tab") {
      if (this.authManager.hasPendingAuth()) {
        e.preventDefault();
        return;
      }
      e.preventDefault();
      const r = t.value, s = this.kernel.getCompletions(r);
      if (s.length === 1) {
        const n = r.lastIndexOf(" "), i = r.substring(0, n + 1);
        t.value = i + s[0];
      } else if (s.length > 1) {
        const n = s.map((i) => {
          const a = i.split("/");
          return i.endsWith("/") ? a[a.length - 2] + "/" : a[a.length - 1];
        });
        this.terminal.print(`
` + n.join("   ")), this.terminal.updatePrompt(this.kernel.getPromptText());
      }
    }
  }
  async handleEnter(e) {
    const t = new AbortController();
    this.currentAbortController = t;
    try {
      let s = e.value.trim();
      const n = this.authManager.hasPendingAuth();
      if (s === "" && !n) {
        this.terminal.updatePrompt(this.kernel.getPromptText()), e.value = "";
        return;
      }
      if (n) {
        this.terminal.copyInputToOutput("********");
        const c = this.authManager.buildAuthenticatedCommand(s);
        this.authManager.clearPendingAuth(), this.terminal.setInputType("text");
        const u = await this.kernel.execute(c, !0, t.signal);
        if (u.startsWith("AUTH_REQUIRED:")) {
          const [, l, h] = u.split(":");
          this.authManager.initiatePendingAuth(l, s), this.terminal.updatePrompt(this.authManager.getPromptText(h)), this.terminal.setInputType("password"), e.value = "";
          return;
        }
        this.processResponse(u), e.value = "", this.historyNavigator.reset();
        return;
      }
      const i = this.historyExpander.expand(s, this.kernel.getHistory());
      i && (s = i, this.terminal.print(s)), this.terminal.copyInputToOutput(s);
      const a = await this.kernel.execute(s, !1, t.signal);
      if (a.startsWith("AUTH_REQUIRED:")) {
        const [, c, u] = a.split(":");
        this.authManager.initiatePendingAuth(c, s), this.terminal.updatePrompt(this.authManager.getPromptText(u)), this.terminal.setInputType("password"), e.value = "";
        return;
      }
      this.processResponse(a), e.value = "", this.historyNavigator.reset();
    } finally {
      this.currentAbortController = null;
    }
  }
  processResponse(e) {
    e === "COMMAND_CLEAR" ? this.terminal.clear() : e !== "" && this.terminal.print(e), this.terminal.updatePrompt(this.kernel.getPromptText()), this.terminal.scrollToBottom();
  }
}
class dt {
  constructor(e, t) {
    m(this, "kernel");
    m(this, "terminalUI");
    m(this, "container");
    m(this, "inputHandler");
    m(this, "terminalEl");
    this.container = e, this.kernel = t || new ot();
  }
  async boot(e) {
    if (await this.kernel.boot(e), this.terminalEl) {
      this.terminalEl.style.display = "block", this.focusInput();
      return;
    }
    this.renderStructure();
  }
  renderStructure() {
    this.terminalEl = document.createElement("div"), this.terminalEl.className = "terminal-instance-wrapper ubuntu-terminal-theme", this.terminalEl.style.width = "100%", this.terminalEl.style.height = "100%", this.terminalEl.innerHTML = `
            <div class="terminal-container">
                <div class="terminal-output">Cargando sistema...</div>
                <div class="input-line">
                    <span class="prompt"></span>
                    <input type="text" class="terminal-input" autofocus spellcheck="false" autocomplete="off">
                </div>
            </div>
        `, this.container.appendChild(this.terminalEl);
    const e = this.terminalEl.querySelector(".terminal-output"), t = this.terminalEl.querySelector(".terminal-input"), r = this.terminalEl.querySelector(".prompt");
    if (!e || !t || !r) {
      console.error("Error crítico: No se pudieron encontrar los elementos de la terminal usando las clases CSS.");
      return;
    }
    this.bootstrap(e, t, r);
  }
  async bootstrap(e, t, r) {
    this.terminalUI = new at(e, t, r), this.terminalUI.clear();
    const s = new ct(), n = new ut(), i = new lt(this.kernel.getHistory());
    if (this.inputHandler = new ht(
      this.kernel,
      this.terminalUI,
      s,
      n,
      i
    ), this.inputHandler.attach(t), this.kernel.getPowerState && this.kernel.getPowerState() === "POWER_OFF") {
      this.applyPowerStateVisuals();
      return;
    }
    this.showWelcomeMessage();
  }
  showWelcomeMessage() {
    var t;
    const e = this.kernel.getEnv ? this.kernel.getEnv("HOSTNAME") : "ts-linux";
    (t = this.terminalEl.querySelector(".terminal-output")) == null || t.classList.add("active-os"), this.terminalUI.print(`Welcome to the virtual machine [${e.toUpperCase()}]`), this.terminalUI.print(`System information as of ${(/* @__PURE__ */ new Date()).toUTCString()}`), this.terminalUI.print(""), this.terminalUI.updatePrompt(this.kernel.getPromptText()), this.focusInput();
  }
  /**
   * Apaga la terminal y limpia la pantalla desde código externo.
   */
  turnOff() {
    this.kernel.shutdown(), this.applyPowerStateVisuals();
  }
  /**
   * Enciende la terminal y restaura el prompt desde código externo.
   */
  turnOn() {
    this.kernel.powerOn(), this.applyPowerStateVisuals();
  }
  /**
   * Sincroniza el estado visual del Input y el Prompt según la energía actual del Kernel
   */
  applyPowerStateVisuals() {
    if (!this.terminalEl) return;
    const e = this.terminalEl.querySelector(".terminal-input"), t = this.terminalEl.querySelector(".prompt"), r = this.terminalEl.querySelector(".input-line");
    !e || !t || !r || (this.kernel.getPowerState() === "POWER_OFF" ? (this.terminalUI.clear(), r.style.display = "none", this.terminalUI.print('The terminal is turned off. Press "Power On" in the hypervisor to start.'), e.disabled = !0, e.value = "", t.innerText = "") : (r.style.display = "flex", e.disabled = !1, this.terminalUI.clear(), this.showWelcomeMessage()));
  }
  focusInput() {
    const e = this.terminalEl.querySelector(".terminal-input");
    e && !e.disabled && e.focus();
  }
  detach() {
    return this.terminalEl && (this.terminalEl.style.display = "none"), this.kernel;
  }
}
const yt = ({
  configUrl: o,
  isPowered: e = !0,
  existingKernel: t
}) => {
  const r = O(null), s = O(null);
  R(() => {
    if (r.current) {
      r.current.innerHTML = "";
      try {
        const i = new dt(r.current, t);
        s.current = i, i.boot(o).then(() => {
          s.current && n(s.current, e);
        }).catch((a) => {
          console.error("Error durante el boot de TSTerminal:", a);
        });
      } catch (i) {
        console.error("Error inicializando ReactTerminal:", i);
      }
      return () => {
        s.current && (s.current.detach(), s.current = null);
      };
    }
  }, [o, t]), R(() => {
    s.current && n(s.current, e);
  }, [e]);
  const n = (i, a) => {
    a ? i.turnOn() : i.turnOff();
  };
  return /* @__PURE__ */ W(
    "div",
    {
      ref: r,
      className: "ubuntu-terminal-theme"
    }
  );
};
export {
  ot as Kernel,
  yt as ReactTerminal,
  dt as TSTerminal
};
