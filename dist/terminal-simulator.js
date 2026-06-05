var yt = Object.defineProperty;
var vt = (o, e, t) => e in o ? yt(o, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : o[e] = t;
var y = (o, e, t) => vt(o, typeof e != "symbol" ? e + "" : e, t);
import We, { useRef as St, useEffect as wt } from "react";
class g {
  constructor(e, t, r) {
    y(this, "isSuccess");
    y(this, "isFailure");
    y(this, "_error");
    y(this, "_value");
    this.isSuccess = e, this.isFailure = !e, this._error = t, this._value = r;
  }
  static ok(e) {
    return new g(!0, void 0, e);
  }
  static fail(e) {
    return new g(!1, e, void 0);
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
const N = {
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
class Et {
  /**
   * Valida si un usuario tiene permiso para realizar una acción
   */
  static canAccess(e, t, r, s) {
    return t === "root" ? !0 : ["/etc", "/bin", "/var", "/sbin"].some((c) => s.startsWith(c)) && r === "write" ? !1 : e.owner === t ? e.permissions.user[r] : e.permissions.others[r];
  }
}
class re {
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
class D {
  /**
   * Toma una ruta y devuelve el nodo correspondiente o null.
   */
  static resolve(e, t, r) {
    if (!e || e === ".") return t;
    if (e === "/") return r;
    const s = e.startsWith("~") ? e.replace("~", "/home") : e;
    let n = s.startsWith("/") ? r : t;
    const i = s.split("/").filter(Boolean);
    for (const c of i)
      if (c !== ".")
        if (c === "..")
          n = n.parent || n;
        else {
          const u = n.children.find((l) => l.name === c);
          if (!u) return null;
          n = u;
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
class bt {
  constructor(e) {
    y(this, "root");
    y(this, "currentDirectory");
    y(this, "previousDirectory");
    y(this, "env");
    this.env = e, this.root = re.create("/", "dir", "root"), this.currentDirectory = this.root, this.previousDirectory = this.root;
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
    const r = this.env.get("USER") || "guest", s = D.getAbsolutePath(e);
    return Et.canAccess(e, r, t, s);
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
      return g.fail(`cannot access '${e}': No such file or directory`);
    if (r.type === "file")
      return g.ok([r]);
    let s = [...r.children];
    return t || (s = s.filter((n) => !n.name.startsWith("."))), g.ok(s.sort((n, i) => n.name.localeCompare(i.name)));
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
    return D.resolve(e, this.currentDirectory, this.root);
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
      return g.fail(N.FS.NOT_FOUND(e));
    if (!this.checkAccess(i, "write"))
      return g.fail(N.FS.PERMISSION_DENIED(e));
    const c = i.children.find((u) => u.name === n);
    if (c)
      return c.type === "dir" ? g.fail(N.FS.IS_DIRECTORY(e)) : this.checkAccess(c, "write") ? (t !== "" && (c.content = t), g.ok(c)) : g.fail(N.FS.PERMISSION_DENIED(e));
    {
      const u = this.env.get("USER") || "root", l = re.create(n, "file", u, i, t);
      return i.children.push(l), g.ok(l);
    }
  }
  mkdir(e) {
    const t = e.lastIndexOf("/"), r = t === -1 ? "." : e.substring(0, t) || "/", s = t === -1 ? e : e.substring(t + 1), n = this.resolvePath(r);
    if (!n || n.type !== "dir")
      return g.fail(N.FS.NOT_FOUND(e));
    if (!this.checkAccess(n, "write"))
      return g.fail(N.FS.PERMISSION_DENIED(e));
    if (n.children.some((c) => c.name === s))
      return g.fail(N.FS.ALREADY_EXISTS(e));
    const i = re.create(s, "dir", this.env.get("USER"), n);
    return n.children.push(i), g.ok(i);
  }
  remove(e, t = !1) {
    const r = this.resolvePath(e);
    return r ? r === this.root ? g.fail("cannot remove root directory '/'") : r === this.currentDirectory ? g.fail("cannot remove current directory '.' or '..'") : r.type === "dir" && !t ? g.fail(N.FS.IS_DIRECTORY(e)) : r.parent && !this.checkAccess(r.parent, "write") ? g.fail(N.FS.PERMISSION_DENIED(e)) : (r.parent && (r.parent.children = r.parent.children.filter((s) => s !== r), r.parent = null), g.ok()) : g.fail(N.FS.NOT_FOUND(e));
  }
  // @/slices/filesystem/application/services/FileSystem.ts
  removeDirectory(e) {
    const t = this.resolvePath(e);
    if (!t)
      return g.fail(N.FS.NOT_FOUND(e));
    if (t.type !== "dir")
      return g.fail(`Failed to remove '${e}': Not a directory`);
    if (t === this.root)
      return g.fail("cannot remove root directory '/'");
    if (t === this.currentDirectory)
      return g.fail("cannot remove current directory '.'");
    if (t.children.length > 0)
      return g.fail(`Failed to remove '${e}': Directory not empty`);
    const s = t.parent || this.resolvePath(e + "/..");
    return s && !this.checkAccess(s, "write") ? g.fail(N.FS.PERMISSION_DENIED(e)) : (s && (s.children = s.children.filter((n) => n.name !== t.name)), g.ok());
  }
  changeDirectory(e) {
    let t = null;
    return e === "-" ? t = this.previousDirectory : t = this.resolvePath(e), t ? t.type !== "dir" ? g.fail(N.FS.NOT_A_DIRECTORY(e)) : (this.previousDirectory = this.currentDirectory, this.currentDirectory = t, g.ok()) : g.fail(N.FS.NOT_FOUND(e));
  }
  cat(e) {
    const t = this.resolvePath(e);
    return t ? t.type === "dir" ? g.fail(N.FS.IS_DIRECTORY(e)) : this.checkAccess(t, "read") ? g.ok(t.content || "") : g.fail(N.FS.PERMISSION_DENIED(e)) : g.fail(N.FS.NOT_FOUND(e));
  }
  /**
   * Realiza una lectura directa de un archivo del sistema ignorando las restricciones 
   * de permisos del usuario actual. Exclusivo para componentes del Kernel.
   */
  catSystem(e) {
    const t = this.resolvePath(e);
    return t ? t.type !== "file" ? g.fail("Not a file") : g.ok(t.content) : g.fail("File not found");
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
      return g.fail(`cannot access '${e}': No such file or directory`);
    if (t !== "root") {
      if (i.owner !== t)
        return g.fail(`changing group of '${e}': Operation not permitted`);
      if (n !== void 0 && !r.includes(t))
        return g.fail(`changing group of '${e}': Group membership required`);
    }
    return s !== void 0 && (i.owner = s), n !== void 0 && (i.group = n), g.ok();
  }
  getModificationTime(e) {
    var t;
    return ((t = this.resolvePath(e)) == null ? void 0 : t.mtime) || 0;
  }
  getType(e) {
    return e.type === "dir" ? g.ok("dir") : e.type === "file" ? g.ok("file") : g.fail(N.FS.UNKNOWN_TYPE(e.name));
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
    const s = D.resolve(e, this.currentDirectory, this.root);
    if (!s) return g.fail(`cp: cannot stat '${e}': No such file or directory`);
    if (s.type === "dir" && !r)
      return g.fail(`cp: -r not specified; omitting directory '${e}'`);
    const n = D.resolve(t, this.currentDirectory, this.root);
    let i = null, c = s.name;
    if (n && n.type === "dir")
      i = n;
    else {
      const l = t.lastIndexOf("/");
      if (l === -1)
        i = this.currentDirectory, c = t;
      else {
        const h = t.substring(0, l) || "/";
        i = D.resolve(h, this.currentDirectory, this.root), c = t.substring(l + 1);
      }
    }
    if (!i || i.type !== "dir")
      return g.fail(`cp: cannot create regular file '${t}': Not a directory`);
    const u = this.cloneNode(s, i);
    return u.name = c, i.children = i.children.filter((l) => l.name !== c), i.children.push(u), g.ok();
  }
  move(e, t) {
    const r = D.resolve(e, this.currentDirectory, this.root);
    if (!r) return g.fail(`mv: cannot stat '${e}': No such file or directory`);
    if (r === this.root) return g.fail("mv: cannot move root directory '/'");
    const s = D.resolve(t, this.currentDirectory, this.root);
    let n = null, i = r.name;
    if (s && s.type === "dir")
      n = s;
    else {
      const c = t.lastIndexOf("/");
      if (c === -1)
        n = this.currentDirectory, i = t;
      else {
        const u = t.substring(0, c) || "/";
        n = D.resolve(u, this.currentDirectory, this.root), i = t.substring(c + 1);
      }
    }
    return !n || n.type !== "dir" ? g.fail(`mv: cannot move to '${t}': Not a directory`) : (r.parent && (r.parent.children = r.parent.children.filter((c) => c !== r)), r.parent = n, r.name = i, n.children = n.children.filter((c) => c.name !== i), n.children.push(r), g.ok());
  }
  // --- CARGA INICIAL DE SEGURIDAD (CENTRALIZAR EN EL FUTURO) ---
  loadDefaults() {
    this.root = re.create("/", "dir", "root"), this.currentDirectory = this.root, this.mkdir("home"), this.mkdir("bin"), this.mkdir("etc"), this.mkdir("var"), this.writeFile("/etc/passwd", `root:x:0:0:root:/root:/bin/bash
guest:x:1000:1000:guest:/home/guest:/bin/bash`), this.writeFile("/etc/group", `root:x:0:
sudo:x:27:guest,nico
`), this.writeFile("home/readme.txt", "Bienvenido al sistema de archivos avanzado.");
  }
}
class xt {
  constructor() {
    y(this, "vars");
    y(this, "aliases", /* @__PURE__ */ new Map());
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
class $t {
  constructor(e, t) {
    y(this, "cachedUsers", []);
    y(this, "cachedGroups", []);
    y(this, "lastUsersSync", -1);
    y(this, "lastShadowSync", -1);
    // 🌟 Nueva marca para trackear /etc/shadow
    y(this, "lastGroupsSync", -1);
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
class Rt {
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
    const t = e.map((c) => `${c.username}:x:${c.uid}:${c.gid}:${c.fullName}:${c.home}:${c.shell}`).join(`
`);
    this.fs.writeFile("/etc/passwd", t);
    const r = Math.floor(Date.now() / (1e3 * 60 * 60 * 24)), s = this.fs.cat("/etc/shadow"), n = s.isSuccess ? this.parseShadow(s.getValue()) : /* @__PURE__ */ new Map(), i = e.map((c) => {
      const u = c.password || n.get(c.username) || "$6$rounds=5000$jsTerminalSalt$c37ce20fffffffff";
      return `${c.username}:${u}:${r}:0:99999:7:::`;
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
      const [r, , s, n, i, c, u] = t.split(":");
      return {
        username: r,
        uid: parseInt(s, 10) || 0,
        gid: parseInt(n, 10) || 0,
        fullName: i || r,
        home: c || `/home/${r}`,
        shell: u || "/bin/bash"
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
class Tt {
  constructor(e) {
    this.env = e;
  }
  async execute(e, t, r, s, n = null, i) {
    const c = e.trim();
    if (!c) return "";
    if (i != null && i.aborted)
      return "COMMAND_ABORTED";
    if (c.includes("|")) {
      const u = c.split("|").map((h) => h.trim());
      let l = "";
      for (const h of u) {
        if (i != null && i.aborted)
          return "COMMAND_ABORTED";
        l = await this.processCommandLine(h, t, r, s, l, n, i);
      }
      return l;
    }
    return await this.processCommandLine(c, t, r, s, "", n, i);
  }
  async processCommandLine(e, t, r, s, n = "", i = null, c) {
    let u = e.trim(), l = null, h = !1;
    const d = u.match(/>>\s*([^\s]+)$/), p = u.match(/>\s*([^\s]+)$/);
    d ? (h = !0, l = d[1], u = u.replace(/>>\s*[^\s]+$/, "").trim()) : p && (h = !1, l = p[1], u = u.replace(/>\s*[^\s]+$/, "").trim());
    const w = u.indexOf(" "), S = w === -1 ? u : u.substring(0, w), P = w === -1 ? "" : u.substring(w), G = this.env.getAlias(S.trim());
    G && (u = `${G}${P}`.trim());
    const _ = this.tokenize(u);
    if (_.length === 0) return "";
    const R = _[0].toLowerCase(), L = _.slice(1), M = t.get(R);
    if (!M) return `-bash: ${R}: command not found`;
    const F = M.valuedFlags || [], z = R === "sudo" ? [...F, "sudo-pass", "--sudo-pass"] : F, se = this.extractAllowedFlagsFromCommand(M, z);
    if (c != null && c.aborted)
      return "COMMAND_ABORTED";
    const { options: J, args: V, flagValues: ne } = this.parseArgsAndFlags(L, z, se), X = {
      args: this.expandGlobPatterns(V, r),
      options: J,
      flagValues: ne,
      rawArgs: L,
      fs: r,
      env: this.env,
      userManager: s,
      pipeInput: n,
      signal: c,
      kernel: i,
      hasFlag: (C) => J.includes(C.startsWith("-") ? C : `-${C}`),
      rawInput: e
    }, k = await M.execute(X);
    if (c != null && c.aborted)
      return "COMMAND_ABORTED";
    if (l) {
      const C = r.writeFile(l, k, h);
      return C.isSuccess ? "" : C.getError();
    }
    return k;
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
    for (let c = 0; c < e.length; c++) {
      const u = e[c];
      if (u.startsWith("-") && u.length > 1) {
        const l = u.startsWith("--"), h = l ? [u.slice(2)] : u.slice(1).split("");
        let d = !1;
        for (let p = 0; p < h.length; p++) {
          const w = h[p], S = l ? `--${w}` : `-${w}`;
          if (r && !r.has(S))
            if (l) {
              n.push(u), d = !0;
              break;
            } else {
              const P = "-" + h.slice(p).join("");
              n.push(P), d = !0;
              break;
            }
          if (s.push(S), t.includes(w) || t.includes(S)) {
            if (!l && u.slice(p + 2).length > 0) {
              i[S] = u.slice(p + 2), d = !0;
              break;
            } else if (c + 1 < e.length) {
              i[S] = e[c + 1], c++, d = !0;
              break;
            }
          }
        }
        if (d) continue;
      } else
        n.push(u);
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
      const n = s.lastIndexOf("/"), i = n === -1 ? "" : s.substring(0, n + 1), c = n === -1 ? "." : s.substring(0, n) || "/", u = n === -1 ? s : s.substring(n + 1), l = t.resolvePath(c);
      if (!l || l.type !== "dir") {
        r.push(s);
        continue;
      }
      const h = this.globToRegExp(u), d = l.children.filter((p) => p.name.startsWith(".") && !u.startsWith(".") ? !1 : h.test(p.name)).map((p) => `${i}${p.name}`);
      d.length > 0 ? r.push(...d) : r.push(s);
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
      for (const c of t)
        c.startsWith("-") || c.startsWith("--") ? n.add(c) : c.length === 1 ? n.add(`-${c}`) : n.add(`--${c}`);
      return n.size > 0 ? n : void 0;
    } catch {
      return;
    }
  }
}
const At = {
  name: "cd",
  execute: ({ args: o, fs: e, env: t }) => {
    const r = o[0] || "~", s = e.changeDirectory(r);
    return s.isFailure ? `cd: ${s.getError()}` : r === "-" ? D.getAbsolutePath(e.getCurrentDirectory()) : (t.set("PWD", D.getAbsolutePath(e.getCurrentDirectory())), "");
  }
}, Nt = {
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
      let c;
      return /^[0-7]{3}$/.test(r) ? c = Dt(r) : c = Ut(n.permissions, r), n.permissions = c, "";
    } catch {
      return `chmod: invalid mode: '${r}'`;
    }
  }
};
function Dt(o) {
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
function Ut(o, e) {
  const t = JSON.parse(JSON.stringify(o)), r = e.match(/^([ugoa]*)([+\-=])([rwx]*)$/);
  if (!r) throw new Error();
  const [, s, n, i] = r, c = s === "" || s.includes("a") ? ["user", "group", "others"] : [];
  s.includes("u") && c.push("user"), s.includes("g") && c.push("group"), s.includes("o") && c.push("others");
  const u = [];
  return i.includes("r") && u.push("read"), i.includes("w") && u.push("write"), i.includes("x") && u.push("execute"), c.forEach((l) => {
    u.forEach((h) => {
      n === "+" && (t[l][h] = !0), n === "-" && (t[l][h] = !1), n === "=" && (t[l].read = i.includes("r"), t[l].write = i.includes("w"), t[l].execute = i.includes("x"));
    });
  }), t;
}
const Pt = {
  name: "ls",
  execute: ({ args: o, hasFlag: e, fs: t }) => {
    const r = o.length ? o : ["."], s = [], n = r.reduce((u, l) => {
      const h = t.resolvePath(l);
      return u + ((h == null ? void 0 : h.type) === "dir" ? 1 : 0);
    }, 0), i = n > 1 || n > 0 && r.length > 1;
    for (const u of r) {
      const l = t.getNodes(u, e("-a"));
      if (l.isFailure)
        return `ls: ${l.getError()}`;
      const h = l.getValue();
      e("-S") ? h.sort((p, w) => {
        var S, P;
        return (((S = w.content) == null ? void 0 : S.length) || 0) - (((P = p.content) == null ? void 0 : P.length) || 0);
      }) : e("-r") && h.reverse();
      let d;
      e("-l") ? d = h.map((p) => {
        var F;
        const S = (p.type === "dir" ? "d" : "-") + de(p.permissions.user) + de(p.permissions.group) + de(p.permissions.others), P = p.owner.padEnd(10), G = (p.group || p.owner).padEnd(10), _ = p.type === "dir" ? 4096 : ((F = p.content) == null ? void 0 : F.length) || 0, R = e("-h") ? Ct(_) : _.toString(), L = new Date(p.createdAt).toLocaleDateString("es-ES", {
          month: "short",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit"
        }), M = je(p, e("-F"));
        return `${S}  1 ${P} ${G} ${R.padStart(8)} ${L} ${M}`;
      }).join(`
`) : d = h.map((p) => je(p, e("-F"))).join(e("-1") ? `
` : "  "), i ? s.push(`${u}:`, d) : s.push(d);
    }
    const c = e("-1") ? `
` : i ? `

` : "  ";
    return s.join(c);
  }
};
function de(o) {
  return [
    o.read ? "r" : "-",
    o.write ? "w" : "-",
    o.execute ? "x" : "-"
  ].join("");
}
function Ct(o) {
  if (o < 1024) return `${o}B`;
  const e = ["K", "M", "G"];
  let t = -1, r = o;
  for (; r >= 1024 && t < e.length - 1; )
    r /= 1024, t++;
  return `${r.toFixed(1)}${e[t]}`;
}
function je(o, e) {
  return o.type === "dir" ? `${o.name}/` : e && o.permissions.execute ? `${o.name}*` : o.name;
}
const Ot = {
  name: "mkdir",
  execute: ({ args: o, fs: e }) => {
    if (o.length < 1) return "mkdir: missing operand";
    const t = e.mkdir(o[0]);
    return t.isFailure ? `mkdir: ${t.getError()}` : "";
  }
}, _t = {
  name: "pwd",
  execute: ({ fs: o }) => D.getAbsolutePath(o.getCurrentDirectory())
}, It = {
  name: "touch",
  execute: ({ args: o, fs: e }) => {
    if (o.length < 1) return "touch: missing file operand";
    const t = o[0], r = o[1] || "", s = e.touch(t, r);
    return s.isFailure ? `touch: ${s.getError()}` : "";
  }
}, kt = {
  name: "file",
  execute: ({ args: o, fs: e }) => {
    if (o.length < 1) return "file: missing file operand";
    const t = o[0], r = e.resolvePath(t);
    if (!r) return `file: ${t}: No such file or directory`;
    const s = e.getType(r);
    return s.isFailure ? `file: ${s.getError()}` : s.getValue() === "dir" ? `${t}: directory` : `${t}: regular file`;
  }
}, Mt = {
  name: "rm",
  execute: ({ args: o, hasFlag: e, fs: t }) => {
    if (o.length < 1)
      return "rm: missing operand";
    const r = e("-r") || e("-R"), s = e("-f"), n = [];
    for (const i of o) {
      const c = t.remove(i, r);
      if (c.isFailure) {
        if (s && /not found|No such file or directory/i.test(c.getError()))
          continue;
        n.push(`rm: cannot remove '${i}': ${c.getError()}`);
      }
    }
    return n.length > 0 ? n.join(`
`) : "";
  }
}, Ft = {
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
}, jt = {
  name: "cp",
  execute: ({ args: o, hasFlag: e, fs: t }) => {
    if (o.length < 2)
      return o.length === 1 ? `cp: missing destination file operand after '${o[0]}'` : "cp: missing file operand";
    const r = o[0], s = o[1], n = e("-r") || e("-R") || e("--recursive"), i = t.copy(r, s, n);
    return i.isFailure ? i.getError() : "";
  }
}, Gt = {
  name: "mv",
  execute: ({ args: o, fs: e }) => {
    if (o.length < 2)
      return o.length === 1 ? `mv: missing destination file operand after '${o[0]}'` : "mv: missing file operand";
    const t = o[0], r = o[1], s = e.move(t, r);
    return s.isFailure ? s.getError() : "";
  }
}, Lt = [
  At,
  Nt,
  Pt,
  Ot,
  _t,
  It,
  kt,
  Mt,
  Ft,
  jt,
  Gt
], Wt = {
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
}, Ht = {
  name: "cmp",
  valuedFlags: [],
  execute: async ({ args: o, fs: e }) => {
    if (o.length < 2)
      return "cmp: usage: cmp file1 file2";
    const t = o[0].trim(), r = o[1].trim(), s = e.getRoot(), n = e.getCurrentDirectory(), i = D.resolve(t, n, s);
    if (!i || i.type !== "file")
      return `cmp: ${t}: No such file or directory`;
    const c = D.resolve(r, n, s);
    if (!c || c.type !== "file")
      return `cmp: ${r}: No such file or directory`;
    const u = i.content || "", l = c.content || "";
    if (u === l)
      return "";
    const h = Math.min(u.length, l.length);
    let d = 1, p = 1;
    for (let w = 0; w < h; w++) {
      const S = u[w], P = l[w];
      if (S !== P)
        return `${t} ${r} differ: byte ${p}, line ${d}`;
      S === `
` && d++, p++;
    }
    return u.length > l.length ? `cmp: EOF on ${r} after byte ${p - 1}, line ${d}` : `cmp: EOF on ${t} after byte ${p - 1}, line ${d}`;
  }
}, Yt = {
  name: "diff",
  valuedFlags: [],
  execute: async ({ args: o, fs: e }) => {
    if (o.length < 2)
      return "diff: usage: diff file1 file2";
    const t = o[0].trim(), r = o[1].trim(), s = e.getRoot(), n = e.getCurrentDirectory(), i = D.resolve(t, n, s);
    if (!i || i.type !== "file")
      return `diff: ${t}: No such file or directory`;
    const c = D.resolve(r, n, s);
    if (!c || c.type !== "file")
      return `diff: ${r}: No such file or directory`;
    const u = (i.content || "").split(`
`), l = (c.content || "").split(`
`);
    if (i.content === c.content)
      return "";
    const h = [], d = Math.max(u.length, l.length);
    let p = 0;
    for (; p < d; ) {
      const w = u[p], S = l[p];
      w !== void 0 && S !== void 0 && w !== S ? (h.push(`${p + 1}c${p + 1}`), h.push(`< ${w}`), h.push("---"), h.push(`> ${S}`)) : w !== void 0 && S === void 0 ? (h.push(`${p + 1}d${l.length}`), h.push(`< ${w}`)) : w === void 0 && S !== void 0 && (h.push(`${u.length}a${p + 1}`), h.push(`> ${S}`)), p++;
    }
    return h.join(`
`);
  }
}, Bt = {
  name: "grep",
  execute: ({ args: o, hasFlag: e, fs: t, pipeInput: r }) => {
    const s = o[0], n = o[1];
    if (!s) return "usage: grep [pattern] [file]";
    let i = "";
    if (r)
      i = r;
    else if (n) {
      const p = t.cat(n);
      if (p.isFailure)
        return `grep: ${p.getError()}`;
      i = p.getValue();
    } else
      return "grep: missing input";
    const c = e("-i"), u = e("-v"), l = e("-c");
    let h;
    try {
      h = new RegExp(s, c ? "i" : "");
    } catch {
      return `grep: invalid regular expression: ${s}`;
    }
    const d = i.split(`
`).filter((p) => {
      const w = h.test(p);
      return u ? !w : w;
    });
    return l ? d.length.toString() : d.join(`
`);
  }
}, qt = {
  name: "wc",
  // No añadimos valuedFlags porque -l, -w y -c son booleanas, no esperan un parámetro.
  execute: async ({ args: o, hasFlag: e, fs: t, pipeInput: r }) => {
    const s = o[0] ? o[0].trim() : "";
    let n = "";
    if (r)
      n = r;
    else {
      if (!s) return "wc: missing file operand";
      const S = t.resolvePath(s);
      if (!S || S.type !== "file")
        return `wc: ${s}: No such file or directory`;
      n = S.content || "";
    }
    const i = n === "" ? 0 : n.split(`
`).length, c = n.trim() === "" ? 0 : n.trim().split(/\s+/).length, u = n.length, l = e("l"), h = e("w"), d = e("c") || e("m"), p = !l && !h && !d, w = [];
    return (l || p) && w.push(i.toString()), (h || p) && w.push(c.toString()), (d || p) && w.push(u.toString()), !r && s && w.push(s), w.join("	");
  }
}, Kt = {
  name: "head",
  valuedFlags: ["n"],
  execute: async ({ args: o, flagValues: e, fs: t, pipeInput: r }) => {
    let s = 10;
    if (e && e["-n"]) {
      const u = parseInt(e["-n"]);
      !isNaN(u) && u > 0 && (s = u);
    }
    const n = o[0] ? o[0].trim() : "";
    let i = "";
    if (r)
      i = r;
    else {
      if (!n) return "head: missing file operand";
      const u = t.resolvePath(n);
      if (!u || u.type !== "file")
        return `head: cannot open '${n}' for reading: No such file or directory`;
      i = u.content || "";
    }
    return i.split(`
`).slice(0, s).join(`
`);
  }
}, zt = {
  name: "tail",
  valuedFlags: ["n"],
  execute: async ({ args: o, flagValues: e, fs: t, pipeInput: r }) => {
    let s = 10;
    if (e && e["-n"]) {
      const u = parseInt(e["-n"]);
      !isNaN(u) && u > 0 && (s = u);
    }
    const n = o[0] ? o[0].trim() : "";
    let i = "";
    if (r)
      i = r;
    else {
      if (!n) return "tail: missing file operand";
      const u = t.resolvePath(n);
      if (!u || u.type !== "file")
        return `tail: cannot open '${n}' for reading: No such file or directory`;
      i = u.content || "";
    }
    const c = i.split(`
`);
    return c.length > 1 && c[c.length - 1] === "" && c.pop(), c.slice(-s).join(`
`);
  }
}, Jt = {
  name: "cut",
  valuedFlags: ["d", "f"],
  // Registramos 'd' (delimiter) y 'f' (fields)
  execute: async ({ args: o, flagValues: e, fs: t, pipeInput: r }) => {
    let s = "	";
    e && e["-d"] && (s = e["-d"]);
    let n = 1;
    if (e && e["-f"]) {
      const h = parseInt(e["-f"]);
      if (!isNaN(h) && h > 0)
        n = h;
      else
        return "cut: fields are numbered from 1";
    }
    const i = o[0] ? o[0].trim() : "";
    let c = "";
    if (r)
      c = r;
    else {
      if (!i) return "cut: missing file operand";
      const h = t.resolvePath(i);
      if (!h || h.type !== "file")
        return `cut: ${i}: No such file or directory`;
      c = h.content || "";
    }
    return c.split(`
`).map((h) => {
      if (h === "") return "";
      if (!h.includes(s)) return h;
      const d = h.split(s);
      return d[n - 1] !== void 0 ? d[n - 1] : "";
    }).join(`
`);
  }
}, Vt = {
  name: "sort",
  execute: async ({ args: o, hasFlag: e, fs: t, pipeInput: r }) => {
    const s = o[0] ? o[0].trim() : "";
    let n = "";
    if (r)
      n = r;
    else {
      if (!s) return "sort: missing file operand";
      const c = t.resolvePath(s);
      if (!c || c.type !== "file")
        return `sort: ${s}: No such file or directory`;
      n = c.content || "";
    }
    const i = n.split(`
`);
    return i.length > 1 && i[i.length - 1] === "" && i.pop(), i.sort((c, u) => c.localeCompare(u)), e("r") && i.reverse(), i.join(`
`);
  }
}, Xt = {
  name: "uniq",
  execute: async ({ args: o, hasFlag: e, fs: t, pipeInput: r }) => {
    const s = o[0] ? o[0].trim() : "";
    let n = "";
    if (r)
      n = r;
    else {
      if (!s) return "uniq: missing file operand";
      const d = t.resolvePath(s);
      if (!d || d.type !== "file")
        return `uniq: ${s}: No such file or directory`;
      n = d.content || "";
    }
    const i = n.split(`
`);
    if (i.length > 1 && i[i.length - 1] === "" && i.pop(), i.length === 0) return "";
    const c = e("c"), u = [];
    let l = i[0], h = 1;
    for (let d = 1; d < i.length; d++)
      i[d] === l ? h++ : (c ? u.push(`  ${h} ${l}`) : u.push(l), l = i[d], h = 1);
    return c ? u.push(`  ${h} ${l}`) : u.push(l), u.join(`
`);
  }
}, Qt = [
  Wt,
  Bt,
  Ht,
  Yt,
  Kt,
  zt,
  qt,
  Jt,
  Vt,
  Xt
], Zt = {
  name: "echo",
  execute: ({ args: o, env: e }) => o.map((t) => {
    if (t.startsWith("$")) {
      const r = t.substring(1);
      return e.get(r) || "";
    }
    return t;
  }).join(" ")
}, er = {
  name: "whoami",
  execute: ({ env: o }) => o.get("USER") || "unknown"
}, tr = {
  name: "clear",
  execute: () => "COMMAND_CLEAR"
}, rr = {
  name: "help",
  execute: async ({ args: o }) => {
    const { commandList: e } = await Promise.resolve().then(() => Ur);
    return `Comandos disponibles: ${e.map((t) => t.name).join(", ")}`;
  }
}, sr = {
  name: "env",
  execute: ({ env: o }) => {
    const e = o.getAll();
    return Object.entries(e).map(([t, r]) => `${t}=${r}`).join(`
`);
  }
}, nr = {
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
}, or = {
  name: "sudo",
  execute: async ({ args: o, kernel: e, env: t, userManager: r, flagValues: s, ...n }) => {
    if (o.length === 0) return "usage: sudo <command> [arguments]";
    const i = t.get("USER") || "guest", u = r.getGroups().find((S) => S.groupName === "sudo" || S.groupName === "wheel"), l = u == null ? void 0 : u.members.includes(i);
    if (i !== "root" && !l)
      return `Sorry, user ${i} is not allowed to execute sudo. This incident will be reported.`;
    let h = s["--sudo-pass"] || s["sudo-pass"] || null;
    if (!h && n.rawInput) {
      const S = n.rawInput.match(/--sudo-pass=(\S+)/);
      S && (h = S[1]);
    }
    if (i !== "root" && !h)
      return `AUTH_REQUIRED:sudo:${i}`;
    if (i !== "root" && h) {
      const S = r.getUserByName(i), P = r.hashPassword(h);
      if (!S || P !== S.password)
        return "sudo: 1 incorrect password attempt";
    }
    const p = o.filter((S) => !S.startsWith("--sudo-pass=")).join(" "), w = i;
    try {
      return t.set("USER", "root"), t.set("SUDO_USER", w), await e.execute(p, !0);
    } catch (S) {
      return `sudo: error executing command: ${S.message}`;
    } finally {
      t.set("USER", w), t.set("SUDO_USER", "");
    }
  }
}, ir = {
  name: "date",
  // description: 'Muestra la fecha y hora del sistema',
  execute: async ({ args: o, hasFlag: e }) => {
    const t = /* @__PURE__ */ new Date();
    if (e("-u") || e("--utc"))
      return t.toUTCString();
    const r = o.find((c) => c.startsWith("+"));
    if (r)
      return ar(t, r.slice(1));
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
function ar(o, e) {
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
const cr = {
  name: "uptime",
  // description: 'Muestra cuánto tiempo lleva el sistema encendido',
  execute: async ({ kernel: o, userManager: e }) => {
    const r = (/* @__PURE__ */ new Date()).toLocaleTimeString("es-ES", { hour12: !1 }), s = o.getUptime(), n = Math.floor(s / 1e3), i = Math.floor(n / 60), c = Math.floor(i / 60), u = Math.floor(c / 24);
    let l = "";
    u > 0 && (l += `${u} day${u > 1 ? "s" : ""}, `), c > 0 && (l += `${c % 24} hour${c % 24 > 1 ? "s" : ""}, `), l += `${i % 60} min${i % 60 > 1 ? "s" : ""}`;
    const h = e.getUsers().length;
    return ` ${r} up ${l},  ${h} users,  load average: 0.05, 0.03, 0.01`;
  }
}, ur = {
  name: "who",
  // description: 'Muestra quién está conectado',
  execute: async ({ env: o, kernel: e }) => {
    const t = o.get("USER") || "guest", r = o.get("HOSTNAME") || "js-terminal", s = new Date(Date.now() - e.getUptime()), n = s.toLocaleString("es-ES", { month: "short" }), i = s.getDate(), c = s.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", hour12: !1 });
    return `${t.padEnd(10)} pts/0        ${n} ${i} ${c} (${r})`;
  }
}, lr = {
  name: "w",
  // description: 'Muestra quién está conectado',
  execute: async ({ env: o, kernel: e }) => {
    const t = o.get("USER") || "guest", r = o.get("HOSTNAME") || "js-terminal", s = new Date(Date.now() - e.getUptime()), n = s.toLocaleString("es-ES", { month: "short" }), i = s.getDate(), c = s.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", hour12: !1 });
    return `${t.padEnd(10)} pts/0        ${n} ${i} ${c} (${r})`;
  }
}, hr = {
  name: "chown",
  // description: 'Cambia el propietario y el grupo de un archivo o directorio',
  execute: async ({ args: o, fs: e, env: t, userManager: r }) => {
    if (t.get("USER") !== "root")
      return "chown: changing ownership: Operation not permitted";
    if (o.length < 2)
      return "usage: chown [OWNER][:[GROUP]] FILE...";
    const s = o[0], n = o[1], [i, c] = s.split(":");
    return i && !r.getUserByName(i) ? `chown: invalid user: '${i}'` : c && !r.getGroups().find((l) => l.groupName === c) ? `chown: invalid group: '${c}'` : e.setOwnership(n, "root", [], i, c).isSuccess ? "" : `chown: cannot access '${n}': No such file or directory`;
  }
}, fr = {
  name: "cal",
  execute: ({ args: o }) => {
    const e = /* @__PURE__ */ new Date();
    let t = e.getMonth(), r = e.getFullYear();
    if (o.length === 1) {
      const d = parseInt(o[0], 10);
      if (isNaN(d) || d < 1 || d > 9999)
        return "cal: illegal year value: use 1-9999";
      r = d;
    } else if (o.length >= 2) {
      const d = parseInt(o[0], 10), p = parseInt(o[1], 10);
      if (isNaN(d) || d < 1 || d > 12)
        return `cal: ${o[0]} is not a valid month (1-12)`;
      if (isNaN(p) || p < 1 || p > 9999)
        return "cal: illegal year value: use 1-9999";
      t = d - 1, r = p;
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
    ], n = new Date(r, t, 1).getDay(), i = new Date(r, t + 1, 0).getDate(), c = [], u = `${s[t]} ${r}`, l = Math.max(0, Math.floor((20 - u.length) / 2));
    c.push(" ".repeat(l) + u), c.push("Su Mo Tu We Th Fr Sa");
    let h = "   ".repeat(n);
    for (let d = 1; d <= i; d++) {
      const p = d.toString().padStart(2, " ");
      h += p + " ", ((n + d) % 7 === 0 || d === i) && (c.push(h.trimEnd()), h = "");
    }
    return c.join(`
`);
  }
}, dr = {
  name: "chgrp",
  execute: async ({ args: o, fs: e, env: t, userManager: r }) => {
    if (o.length < 2)
      return "usage: chgrp GROUP FILE...";
    const s = o[0], n = o[1], i = t.get("USER") || "guest", c = r.getGroups().find((l) => l.groupName === s);
    if (!c)
      return `chgrp: invalid group: '${s}'`;
    const u = e.setOwnership(
      n,
      i,
      c.members,
      void 0,
      // No alteramos el dueño (owner)
      s
      // Cambiamos el grupo
    );
    return u.isFailure ? `chgrp: ${u.getError()}` : "";
  }
}, pr = {
  name: "alias",
  valuedFlags: [],
  execute: async ({ args: o, rawArgs: e, env: t, rawInput: r }) => {
    if (o.length === 0) {
      const u = t.getAliases();
      return u.length === 0 ? "" : u.map(([l, h]) => `alias ${l}='${h}'`).join(`
`);
    }
    const s = r == null ? void 0 : r.indexOf("=");
    if (s === -1) {
      const u = o[0].trim(), l = t.getAlias(u);
      return l ? `alias ${u}='${l}'` : `shell: alias: ${u}: not found`;
    }
    const n = r == null ? void 0 : r.substring(0, s).trim(), i = n == null ? void 0 : n.replace(/^alias\s+/, "").trim();
    let c = r == null ? void 0 : r.substring(s ? s + 1 : 0).trim();
    return (c != null && c.startsWith("'") && (c != null && c.endsWith("'")) || c != null && c.startsWith('"') && (c != null && c.endsWith('"'))) && (c = c == null ? void 0 : c.substring(1, c.length - 1)), i === "" ? "alias: invalid alias name" : (t.setAlias(i, c), "");
  }
}, mr = {
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
}, gr = [
  or,
  tr,
  Zt,
  sr,
  rr,
  er,
  nr,
  ir,
  cr,
  ur,
  lr,
  hr,
  fr,
  dr,
  pr,
  mr
], yr = {
  name: "groups",
  // description: 'Muestra los grupos a los que pertenece un usuario',
  execute: async ({ args: o, userManager: e, env: t }) => {
    const r = o[0] || t.get("USER"), n = e.getGroups().filter((i) => i.groupName === r || i.members.includes(r)).map((i) => i.groupName);
    return n.length === 0 ? `${r} : no groups found` : `${r} : ${n.join(" ")}`;
  }
}, vr = {
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
}, Sr = {
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
      const c = t.getGroups();
      n = c.length > 0 ? Math.max(...c.map((u) => u.gid)) + 1 : 1e3;
    }
    const i = t.saveGroup({
      groupName: s,
      gid: n,
      members: []
      // Nuevo grupo nace sin miembros
    });
    return i || `Añadiendo el grupo '${s}' (GID ${n})... Hecho.`;
  }
}, wr = {
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
}, Er = {
  name: "useradd",
  valuedFlags: ["u", "s"],
  execute: async ({ args: o, flagValues: e, userManager: t, fs: r, env: s }) => {
    if (s.get("USER") !== "root")
      return "useradd: Only root can do that";
    if (o.length < 1)
      return "useradd: missing username";
    const n = o[0], i = t.getUsers();
    if (i.some((d) => d.username === n))
      return `useradd: user '${n}' already exists`;
    let c;
    if (e["-u"] || e["--u"]) {
      if (c = parseInt(e["-u"] || e["--u"]), isNaN(c)) return "useradd: invalid numeric argument for -u";
      if (i.some((d) => d.uid === c))
        return `useradd: UID ${c} already exists`;
    } else
      c = i.length > 0 ? Math.max(...i.map((d) => d.uid)) + 1 : 1e3;
    const u = {
      username: n,
      uid: c,
      gid: c,
      home: `/home/${n}`,
      shell: e["-s"] || e["--s"] || "/bin/bash",
      fullName: n,
      password: "!"
      // 🌟 Cuenta bloqueada por defecto hasta asignación manual
    }, l = t.saveUser(u);
    if (l) return l;
    const h = e["-s"] || e["--s"] ? ` with shell ${u.shell}` : "";
    return `useradd: user '${n}' added (UID: ${c})${h}
Notice: Account is locked until a password is set via 'passwd'.`;
  }
}, br = {
  name: "deluser",
  // description: 'Elimina un usuario del sistema',
  execute: async ({ args: o, userManager: e, env: t, fs: r }) => {
    if (t.get("USER") !== "root") return "deluser: Only root can do that";
    if (o.length === 0) return "deluser: enter a username";
    const s = o[0], n = t.get("USER"), i = t.get("SUDO_USER") || n;
    if (s === i)
      return `deluser: The user '${s}' is currently logged in and cannot be deleted.`;
    const c = e.deleteUser(s);
    return c || `Removing user '${s}'... Done.`;
  }
}, xr = {
  name: "delgroup",
  // description: 'Elimina un grupo del sistema',
  execute: async ({ args: o, userManager: e, env: t }) => {
    if (t.get("USER") !== "root") return "delgroup: Only root can do that";
    if (o.length === 0) return "delgroup: enter a group name";
    const r = o[0], s = e.deleteGroup(r);
    return s || `Removing group '${r}'... Done.`;
  }
}, $r = {
  name: "finger",
  execute: async ({ args: o, fs: e }) => {
    const t = e.resolvePath("/etc/passwd");
    if (!t || t.type !== "file")
      return "finger: cannot read system user database";
    const s = (t.content || "").split(`
`).filter((i) => i.trim() !== "");
    if (o.length > 0) {
      const i = o[0].trim().toLowerCase(), c = s.find((S) => S.startsWith(`${i}:`));
      if (!c) return `finger: ${i}: no such user`;
      const u = c.split(":"), l = u[0], h = u[2], d = u[4] || l, p = u[5], w = u[6];
      return [
        `Login: ${l}				Name: ${d}`,
        `Directory: ${p}			Shell: ${w}`,
        `UID: ${h}				Status: Active`,
        "Project: No profile project file specified."
      ].join(`
`);
    }
    const n = ["Login		Name		TTY	Idle	Login Time"];
    return s.forEach((i) => {
      const c = i.split(":");
      if (c.length >= 6) {
        const u = c[0], l = c[4] || c[0];
        n.push(`${u.padEnd(12)}${l.padEnd(16)}pts/0	*	May 17 20:26`);
      }
    }), n.join(`
`);
  }
}, Rr = {
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
    const c = r.resolvePath("/etc/passwd");
    if (!c || c.type !== "file")
      return "passwd: User database (/etc/passwd) not found";
    if (!(c.content || "").split(`
`).some((d) => d.startsWith(`${n}:`)))
      return `passwd: user '${n}' does not exist`;
    const h = e.updatePassword(n, i);
    return h || `passwd: password updated successfully for user '${n}'`;
  }
}, Tr = [
  wr,
  Er,
  yr,
  vr,
  Sr,
  br,
  xr,
  $r,
  Rr
], Ar = {
  name: "save",
  execute: ({ kernel: o }) => {
    try {
      const e = o.exportFullSystemState(), t = JSON.stringify(e, null, 2), r = new Blob([t], { type: "application/json" }), s = URL.createObjectURL(r), n = document.createElement("a");
      return n.href = s, n.download = "system_init.json", document.body.appendChild(n), n.click(), document.body.removeChild(n), URL.revokeObjectURL(s), "Estado completo del sistema (FS, Users, History) exportado.";
    } catch (e) {
      return "Error al exportar: " + e;
    }
  }
}, Nr = {
  name: "easteregg",
  execute: () => "Esto es un Easter Egg."
}, Dr = [
  Ar,
  Nr
], He = [
  ...gr,
  ...Lt,
  ...Qt,
  ...Tr,
  ...Dr
], Ur = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  commandList: He
}, Symbol.toStringTag, { value: "Module" }));
class Pr {
  constructor() {
    y(this, "commands", /* @__PURE__ */ new Map());
    this.loadCommands();
  }
  loadCommands() {
    He.forEach((e) => {
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
class Cr {
  constructor(e) {
    y(this, "key", "fileSystem");
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
class Or {
  constructor(e) {
    y(this, "key", "env");
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
class _r {
  constructor(e) {
    y(this, "key", "groups");
    this.userManager = e;
  }
  getState() {
    return this.userManager.getGroups();
  }
  loadState(e) {
    this.userManager.saveGroup(e);
  }
}
class Ir {
  constructor(e) {
    y(this, "key", "users");
    this.userManager = e;
  }
  getState() {
    return this.userManager.getUsers();
  }
  loadState(e) {
    this.userManager.saveUser(e);
  }
}
class kr {
  // El historial sí puede ser nativo del Kernel si se maneja aquí
  constructor(e, t = "/public/vms/default.json") {
    y(this, "savers", /* @__PURE__ */ new Map());
    y(this, "history", []);
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
class Mr {
  constructor(e, t = "/vms/default.json") {
    y(this, "envStateImpl");
    y(this, "fsStateImpl");
    y(this, "userStateImpl");
    y(this, "groupStateImpl");
    y(this, "jsonStorageImpl");
    this.envStateImpl = new Or(e.environment), this.fsStateImpl = new Cr(e.fileSystem), this.userStateImpl = new Ir(e.userManager), this.groupStateImpl = new _r(e.userManager);
    const r = [
      this.envStateImpl,
      this.fsStateImpl,
      this.userStateImpl,
      this.groupStateImpl
    ];
    this.jsonStorageImpl = new kr(r, t);
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
class Fr {
  constructor(e, t, r) {
    y(this, "fileSystem");
    y(this, "environment");
    y(this, "userManager");
    this.fileSystem = e, this.environment = t, this.userManager = r;
  }
  generatePromptText() {
    const e = this.environment.get("USER") || "guest", t = this.environment.get("HOSTNAME") || "js-terminal", r = D.getAbsolutePath(this.fileSystem.getCurrentDirectory());
    return `${e}@${t}:${r}$ `;
  }
  getCompletions(e) {
    const t = e.split(/\s+/), r = t[t.length - 1], s = r.lastIndexOf("/");
    let n = r, i = "", c;
    return s !== -1 ? (i = r.substring(0, s + 1), n = r.substring(s + 1), c = D.resolve(
      i,
      this.fileSystem.getCurrentDirectory(),
      this.fileSystem.getRoot()
    )) : c = this.fileSystem.getCurrentDirectory(), !c || c.type !== "dir" ? [] : c.children.filter((u) => u.name.startsWith(n)).map((u) => {
      const l = u.type === "dir" ? "/" : " ";
      return i + u.name + l;
    });
  }
  loadDefaults() {
    this.environment.loadDefaults(), this.fileSystem.loadDefaults(), this.userManager.loadDefaults();
  }
}
class jr {
  constructor(e = "/vms/default.json") {
    y(this, "startTime");
    y(this, "history", []);
    y(this, "isReady", !1);
    y(this, "executor");
    y(this, "registry");
    y(this, "orchestrator");
    y(this, "persistence");
    this.startTime = Date.now();
    const t = new xt(), r = new bt(t), s = new Rt(r), n = new $t(r, s);
    this.orchestrator = new Fr(r, t, n), this.executor = new Tt(t), this.registry = new Pr(), this.persistence = new Mr(this.orchestrator, e);
  }
  async boot() {
    this.isReady || (await this.persistence.initSystem(this.orchestrator), this.isReady = !0);
  }
  async execute(e, t = !1, r) {
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
class Gr {
  constructor(e, t, r) {
    y(this, "outputElement");
    y(this, "inputElement");
    y(this, "promptElement");
    this.outputElement = e, this.inputElement = t, this.promptElement = r, this.init();
  }
  init() {
    window.addEventListener("click", () => this.inputElement.focus());
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
    s.innerText = e, t.appendChild(r), t.appendChild(s), this.outputElement.appendChild(t);
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
class Lr {
  constructor() {
    y(this, "pendingAuth", null);
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
class Wr {
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
class Hr {
  constructor(e) {
    y(this, "currentIndex", -1);
    y(this, "history");
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
class Yr {
  constructor(e, t, r, s, n) {
    y(this, "currentAbortController", null);
    this.kernel = e, this.terminal = t, this.authManager = r, this.historyExpander = s, this.historyNavigator = n;
  }
  attach(e) {
    e.addEventListener("keydown", async (t) => {
      await this.handleKeyDown(t, e);
    });
  }
  async handleKeyDown(e, t) {
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
          const c = i.split("/");
          return i.endsWith("/") ? c[c.length - 2] + "/" : c[c.length - 1];
        });
        this.terminal.print(`
` + n.join("  ")), this.terminal.updatePrompt(this.kernel.getPromptText());
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
        const u = this.authManager.buildAuthenticatedCommand(s);
        this.authManager.clearPendingAuth(), this.terminal.setInputType("text");
        const l = await this.kernel.execute(u, !0, t.signal);
        if (l.startsWith("AUTH_REQUIRED:")) {
          const [, h, d] = l.split(":");
          this.authManager.initiatePendingAuth(h, s), this.terminal.updatePrompt(this.authManager.getPromptText(d)), this.terminal.setInputType("password"), e.value = "";
          return;
        }
        this.processResponse(l), e.value = "", this.historyNavigator.reset();
        return;
      }
      const i = this.historyExpander.expand(s, this.kernel.getHistory());
      i && (s = i, this.terminal.print(s)), this.terminal.copyInputToOutput(s);
      const c = await this.kernel.execute(s, !1, t.signal);
      if (c.startsWith("AUTH_REQUIRED:")) {
        const [, u, l] = c.split(":");
        this.authManager.initiatePendingAuth(u, s), this.terminal.updatePrompt(this.authManager.getPromptText(l)), this.terminal.setInputType("password"), e.value = "";
        return;
      }
      this.processResponse(c), e.value = "", this.historyNavigator.reset();
    } finally {
      this.currentAbortController = null;
    }
  }
  processResponse(e) {
    e === "COMMAND_CLEAR" ? this.terminal.clear() : e !== "" && this.terminal.print(e), this.terminal.updatePrompt(this.kernel.getPromptText()), this.terminal.scrollToBottom();
  }
}
class Br {
  constructor(e, t) {
    y(this, "kernel");
    y(this, "terminalUI");
    this.kernel = new jr(t), this.renderStructure(e);
  }
  // 1. Inyectamos dinámicamente tu estructura de index.html
  renderStructure(e) {
    e.innerHTML = `
            <div id="terminal-container">
                <div id="output">Cargando sistema...</div>
                <div class="input-line">
                    <span id="prompt" class="prompt"></span>
                    <input type="text" id="terminal-input" autofocus spellcheck="false" autocomplete="off">
                </div>
            </div>
        `;
    const t = e.querySelector("#output"), r = e.querySelector("#terminal-input"), s = e.querySelector("#prompt");
    this.bootstrap(t, r, s);
  }
  async bootstrap(e, t, r) {
    await this.kernel.boot(), this.terminalUI = new Gr(e, t, r), this.terminalUI.clear();
    const s = new Lr(), n = new Wr(), i = new Hr(this.kernel.getHistory());
    new Yr(
      this.kernel,
      this.terminalUI,
      s,
      n,
      i
    ).attach(t), this.terminalUI.print("Welcome to Ubuntu 24.04 LTS (GNU/Linux 6.8.0-generic x86_64)"), this.terminalUI.print(`System information as of ${(/* @__PURE__ */ new Date()).toUTCString()}`), this.terminalUI.print(""), this.terminalUI.updatePrompt(this.kernel.getPromptText()), t.focus();
  }
}
var pe = { exports: {} }, q = {};
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Ge;
function qr() {
  if (Ge) return q;
  Ge = 1;
  var o = We, e = Symbol.for("react.element"), t = Symbol.for("react.fragment"), r = Object.prototype.hasOwnProperty, s = o.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner, n = { key: !0, ref: !0, __self: !0, __source: !0 };
  function i(c, u, l) {
    var h, d = {}, p = null, w = null;
    l !== void 0 && (p = "" + l), u.key !== void 0 && (p = "" + u.key), u.ref !== void 0 && (w = u.ref);
    for (h in u) r.call(u, h) && !n.hasOwnProperty(h) && (d[h] = u[h]);
    if (c && c.defaultProps) for (h in u = c.defaultProps, u) d[h] === void 0 && (d[h] = u[h]);
    return { $$typeof: e, type: c, key: p, ref: w, props: d, _owner: s.current };
  }
  return q.Fragment = t, q.jsx = i, q.jsxs = i, q;
}
var K = {};
/**
 * @license React
 * react-jsx-runtime.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Le;
function Kr() {
  return Le || (Le = 1, process.env.NODE_ENV !== "production" && function() {
    var o = We, e = Symbol.for("react.element"), t = Symbol.for("react.portal"), r = Symbol.for("react.fragment"), s = Symbol.for("react.strict_mode"), n = Symbol.for("react.profiler"), i = Symbol.for("react.provider"), c = Symbol.for("react.context"), u = Symbol.for("react.forward_ref"), l = Symbol.for("react.suspense"), h = Symbol.for("react.suspense_list"), d = Symbol.for("react.memo"), p = Symbol.for("react.lazy"), w = Symbol.for("react.offscreen"), S = Symbol.iterator, P = "@@iterator";
    function G(a) {
      if (a === null || typeof a != "object")
        return null;
      var f = S && a[S] || a[P];
      return typeof f == "function" ? f : null;
    }
    var _ = o.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
    function R(a) {
      {
        for (var f = arguments.length, m = new Array(f > 1 ? f - 1 : 0), v = 1; v < f; v++)
          m[v - 1] = arguments[v];
        L("error", a, m);
      }
    }
    function L(a, f, m) {
      {
        var v = _.ReactDebugCurrentFrame, x = v.getStackAddendum();
        x !== "" && (f += "%s", m = m.concat([x]));
        var $ = m.map(function(b) {
          return String(b);
        });
        $.unshift("Warning: " + f), Function.prototype.apply.call(console[a], console, $);
      }
    }
    var M = !1, F = !1, z = !1, se = !1, J = !1, V;
    V = Symbol.for("react.module.reference");
    function ne(a) {
      return !!(typeof a == "string" || typeof a == "function" || a === r || a === n || J || a === s || a === l || a === h || se || a === w || M || F || z || typeof a == "object" && a !== null && (a.$$typeof === p || a.$$typeof === d || a.$$typeof === i || a.$$typeof === c || a.$$typeof === u || // This needs to include all possible module reference object
      // types supported by any Flight configuration anywhere since
      // we don't know which Flight build this will end up being used
      // with.
      a.$$typeof === V || a.getModuleId !== void 0));
    }
    function me(a, f, m) {
      var v = a.displayName;
      if (v)
        return v;
      var x = f.displayName || f.name || "";
      return x !== "" ? m + "(" + x + ")" : m;
    }
    function X(a) {
      return a.displayName || "Context";
    }
    function k(a) {
      if (a == null)
        return null;
      if (typeof a.tag == "number" && R("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), typeof a == "function")
        return a.displayName || a.name || null;
      if (typeof a == "string")
        return a;
      switch (a) {
        case r:
          return "Fragment";
        case t:
          return "Portal";
        case n:
          return "Profiler";
        case s:
          return "StrictMode";
        case l:
          return "Suspense";
        case h:
          return "SuspenseList";
      }
      if (typeof a == "object")
        switch (a.$$typeof) {
          case c:
            var f = a;
            return X(f) + ".Consumer";
          case i:
            var m = a;
            return X(m._context) + ".Provider";
          case u:
            return me(a, a.render, "ForwardRef");
          case d:
            var v = a.displayName || null;
            return v !== null ? v : k(a.type) || "Memo";
          case p: {
            var x = a, $ = x._payload, b = x._init;
            try {
              return k(b($));
            } catch {
              return null;
            }
          }
        }
      return null;
    }
    var C = Object.assign, Y = 0, ge, ye, ve, Se, we, Ee, be;
    function xe() {
    }
    xe.__reactDisabledLog = !0;
    function Ye() {
      {
        if (Y === 0) {
          ge = console.log, ye = console.info, ve = console.warn, Se = console.error, we = console.group, Ee = console.groupCollapsed, be = console.groupEnd;
          var a = {
            configurable: !0,
            enumerable: !0,
            value: xe,
            writable: !0
          };
          Object.defineProperties(console, {
            info: a,
            log: a,
            warn: a,
            error: a,
            group: a,
            groupCollapsed: a,
            groupEnd: a
          });
        }
        Y++;
      }
    }
    function Be() {
      {
        if (Y--, Y === 0) {
          var a = {
            configurable: !0,
            enumerable: !0,
            writable: !0
          };
          Object.defineProperties(console, {
            log: C({}, a, {
              value: ge
            }),
            info: C({}, a, {
              value: ye
            }),
            warn: C({}, a, {
              value: ve
            }),
            error: C({}, a, {
              value: Se
            }),
            group: C({}, a, {
              value: we
            }),
            groupCollapsed: C({}, a, {
              value: Ee
            }),
            groupEnd: C({}, a, {
              value: be
            })
          });
        }
        Y < 0 && R("disabledDepth fell below zero. This is a bug in React. Please file an issue.");
      }
    }
    var oe = _.ReactCurrentDispatcher, ie;
    function Q(a, f, m) {
      {
        if (ie === void 0)
          try {
            throw Error();
          } catch (x) {
            var v = x.stack.trim().match(/\n( *(at )?)/);
            ie = v && v[1] || "";
          }
        return `
` + ie + a;
      }
    }
    var ae = !1, Z;
    {
      var qe = typeof WeakMap == "function" ? WeakMap : Map;
      Z = new qe();
    }
    function $e(a, f) {
      if (!a || ae)
        return "";
      {
        var m = Z.get(a);
        if (m !== void 0)
          return m;
      }
      var v;
      ae = !0;
      var x = Error.prepareStackTrace;
      Error.prepareStackTrace = void 0;
      var $;
      $ = oe.current, oe.current = null, Ye();
      try {
        if (f) {
          var b = function() {
            throw Error();
          };
          if (Object.defineProperty(b.prototype, "props", {
            set: function() {
              throw Error();
            }
          }), typeof Reflect == "object" && Reflect.construct) {
            try {
              Reflect.construct(b, []);
            } catch (O) {
              v = O;
            }
            Reflect.construct(a, [], b);
          } else {
            try {
              b.call();
            } catch (O) {
              v = O;
            }
            a.call(b.prototype);
          }
        } else {
          try {
            throw Error();
          } catch (O) {
            v = O;
          }
          a();
        }
      } catch (O) {
        if (O && v && typeof O.stack == "string") {
          for (var E = O.stack.split(`
`), U = v.stack.split(`
`), T = E.length - 1, A = U.length - 1; T >= 1 && A >= 0 && E[T] !== U[A]; )
            A--;
          for (; T >= 1 && A >= 0; T--, A--)
            if (E[T] !== U[A]) {
              if (T !== 1 || A !== 1)
                do
                  if (T--, A--, A < 0 || E[T] !== U[A]) {
                    var I = `
` + E[T].replace(" at new ", " at ");
                    return a.displayName && I.includes("<anonymous>") && (I = I.replace("<anonymous>", a.displayName)), typeof a == "function" && Z.set(a, I), I;
                  }
                while (T >= 1 && A >= 0);
              break;
            }
        }
      } finally {
        ae = !1, oe.current = $, Be(), Error.prepareStackTrace = x;
      }
      var H = a ? a.displayName || a.name : "", j = H ? Q(H) : "";
      return typeof a == "function" && Z.set(a, j), j;
    }
    function Ke(a, f, m) {
      return $e(a, !1);
    }
    function ze(a) {
      var f = a.prototype;
      return !!(f && f.isReactComponent);
    }
    function ee(a, f, m) {
      if (a == null)
        return "";
      if (typeof a == "function")
        return $e(a, ze(a));
      if (typeof a == "string")
        return Q(a);
      switch (a) {
        case l:
          return Q("Suspense");
        case h:
          return Q("SuspenseList");
      }
      if (typeof a == "object")
        switch (a.$$typeof) {
          case u:
            return Ke(a.render);
          case d:
            return ee(a.type, f, m);
          case p: {
            var v = a, x = v._payload, $ = v._init;
            try {
              return ee($(x), f, m);
            } catch {
            }
          }
        }
      return "";
    }
    var B = Object.prototype.hasOwnProperty, Re = {}, Te = _.ReactDebugCurrentFrame;
    function te(a) {
      if (a) {
        var f = a._owner, m = ee(a.type, a._source, f ? f.type : null);
        Te.setExtraStackFrame(m);
      } else
        Te.setExtraStackFrame(null);
    }
    function Je(a, f, m, v, x) {
      {
        var $ = Function.call.bind(B);
        for (var b in a)
          if ($(a, b)) {
            var E = void 0;
            try {
              if (typeof a[b] != "function") {
                var U = Error((v || "React class") + ": " + m + " type `" + b + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + typeof a[b] + "`.This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`.");
                throw U.name = "Invariant Violation", U;
              }
              E = a[b](f, b, v, m, null, "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED");
            } catch (T) {
              E = T;
            }
            E && !(E instanceof Error) && (te(x), R("%s: type specification of %s `%s` is invalid; the type checker function must return `null` or an `Error` but returned a %s. You may have forgotten to pass an argument to the type checker creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and shape all require an argument).", v || "React class", m, b, typeof E), te(null)), E instanceof Error && !(E.message in Re) && (Re[E.message] = !0, te(x), R("Failed %s type: %s", m, E.message), te(null));
          }
      }
    }
    var Ve = Array.isArray;
    function ce(a) {
      return Ve(a);
    }
    function Xe(a) {
      {
        var f = typeof Symbol == "function" && Symbol.toStringTag, m = f && a[Symbol.toStringTag] || a.constructor.name || "Object";
        return m;
      }
    }
    function Qe(a) {
      try {
        return Ae(a), !1;
      } catch {
        return !0;
      }
    }
    function Ae(a) {
      return "" + a;
    }
    function Ne(a) {
      if (Qe(a))
        return R("The provided key is an unsupported type %s. This value must be coerced to a string before before using it here.", Xe(a)), Ae(a);
    }
    var De = _.ReactCurrentOwner, Ze = {
      key: !0,
      ref: !0,
      __self: !0,
      __source: !0
    }, Ue, Pe;
    function et(a) {
      if (B.call(a, "ref")) {
        var f = Object.getOwnPropertyDescriptor(a, "ref").get;
        if (f && f.isReactWarning)
          return !1;
      }
      return a.ref !== void 0;
    }
    function tt(a) {
      if (B.call(a, "key")) {
        var f = Object.getOwnPropertyDescriptor(a, "key").get;
        if (f && f.isReactWarning)
          return !1;
      }
      return a.key !== void 0;
    }
    function rt(a, f) {
      typeof a.ref == "string" && De.current;
    }
    function st(a, f) {
      {
        var m = function() {
          Ue || (Ue = !0, R("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", f));
        };
        m.isReactWarning = !0, Object.defineProperty(a, "key", {
          get: m,
          configurable: !0
        });
      }
    }
    function nt(a, f) {
      {
        var m = function() {
          Pe || (Pe = !0, R("%s: `ref` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", f));
        };
        m.isReactWarning = !0, Object.defineProperty(a, "ref", {
          get: m,
          configurable: !0
        });
      }
    }
    var ot = function(a, f, m, v, x, $, b) {
      var E = {
        // This tag allows us to uniquely identify this as a React Element
        $$typeof: e,
        // Built-in properties that belong on the element
        type: a,
        key: f,
        ref: m,
        props: b,
        // Record the component responsible for creating this element.
        _owner: $
      };
      return E._store = {}, Object.defineProperty(E._store, "validated", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: !1
      }), Object.defineProperty(E, "_self", {
        configurable: !1,
        enumerable: !1,
        writable: !1,
        value: v
      }), Object.defineProperty(E, "_source", {
        configurable: !1,
        enumerable: !1,
        writable: !1,
        value: x
      }), Object.freeze && (Object.freeze(E.props), Object.freeze(E)), E;
    };
    function it(a, f, m, v, x) {
      {
        var $, b = {}, E = null, U = null;
        m !== void 0 && (Ne(m), E = "" + m), tt(f) && (Ne(f.key), E = "" + f.key), et(f) && (U = f.ref, rt(f, x));
        for ($ in f)
          B.call(f, $) && !Ze.hasOwnProperty($) && (b[$] = f[$]);
        if (a && a.defaultProps) {
          var T = a.defaultProps;
          for ($ in T)
            b[$] === void 0 && (b[$] = T[$]);
        }
        if (E || U) {
          var A = typeof a == "function" ? a.displayName || a.name || "Unknown" : a;
          E && st(b, A), U && nt(b, A);
        }
        return ot(a, E, U, x, v, De.current, b);
      }
    }
    var ue = _.ReactCurrentOwner, Ce = _.ReactDebugCurrentFrame;
    function W(a) {
      if (a) {
        var f = a._owner, m = ee(a.type, a._source, f ? f.type : null);
        Ce.setExtraStackFrame(m);
      } else
        Ce.setExtraStackFrame(null);
    }
    var le;
    le = !1;
    function he(a) {
      return typeof a == "object" && a !== null && a.$$typeof === e;
    }
    function Oe() {
      {
        if (ue.current) {
          var a = k(ue.current.type);
          if (a)
            return `

Check the render method of \`` + a + "`.";
        }
        return "";
      }
    }
    function at(a) {
      return "";
    }
    var _e = {};
    function ct(a) {
      {
        var f = Oe();
        if (!f) {
          var m = typeof a == "string" ? a : a.displayName || a.name;
          m && (f = `

Check the top-level render call using <` + m + ">.");
        }
        return f;
      }
    }
    function Ie(a, f) {
      {
        if (!a._store || a._store.validated || a.key != null)
          return;
        a._store.validated = !0;
        var m = ct(f);
        if (_e[m])
          return;
        _e[m] = !0;
        var v = "";
        a && a._owner && a._owner !== ue.current && (v = " It was passed a child from " + k(a._owner.type) + "."), W(a), R('Each child in a list should have a unique "key" prop.%s%s See https://reactjs.org/link/warning-keys for more information.', m, v), W(null);
      }
    }
    function ke(a, f) {
      {
        if (typeof a != "object")
          return;
        if (ce(a))
          for (var m = 0; m < a.length; m++) {
            var v = a[m];
            he(v) && Ie(v, f);
          }
        else if (he(a))
          a._store && (a._store.validated = !0);
        else if (a) {
          var x = G(a);
          if (typeof x == "function" && x !== a.entries)
            for (var $ = x.call(a), b; !(b = $.next()).done; )
              he(b.value) && Ie(b.value, f);
        }
      }
    }
    function ut(a) {
      {
        var f = a.type;
        if (f == null || typeof f == "string")
          return;
        var m;
        if (typeof f == "function")
          m = f.propTypes;
        else if (typeof f == "object" && (f.$$typeof === u || // Note: Memo only checks outer props here.
        // Inner props are checked in the reconciler.
        f.$$typeof === d))
          m = f.propTypes;
        else
          return;
        if (m) {
          var v = k(f);
          Je(m, a.props, "prop", v, a);
        } else if (f.PropTypes !== void 0 && !le) {
          le = !0;
          var x = k(f);
          R("Component %s declared `PropTypes` instead of `propTypes`. Did you misspell the property assignment?", x || "Unknown");
        }
        typeof f.getDefaultProps == "function" && !f.getDefaultProps.isReactClassApproved && R("getDefaultProps is only used on classic React.createClass definitions. Use a static property named `defaultProps` instead.");
      }
    }
    function lt(a) {
      {
        for (var f = Object.keys(a.props), m = 0; m < f.length; m++) {
          var v = f[m];
          if (v !== "children" && v !== "key") {
            W(a), R("Invalid prop `%s` supplied to `React.Fragment`. React.Fragment can only have `key` and `children` props.", v), W(null);
            break;
          }
        }
        a.ref !== null && (W(a), R("Invalid attribute `ref` supplied to `React.Fragment`."), W(null));
      }
    }
    var Me = {};
    function Fe(a, f, m, v, x, $) {
      {
        var b = ne(a);
        if (!b) {
          var E = "";
          (a === void 0 || typeof a == "object" && a !== null && Object.keys(a).length === 0) && (E += " You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.");
          var U = at();
          U ? E += U : E += Oe();
          var T;
          a === null ? T = "null" : ce(a) ? T = "array" : a !== void 0 && a.$$typeof === e ? (T = "<" + (k(a.type) || "Unknown") + " />", E = " Did you accidentally export a JSX literal instead of a component?") : T = typeof a, R("React.jsx: type is invalid -- expected a string (for built-in components) or a class/function (for composite components) but got: %s.%s", T, E);
        }
        var A = it(a, f, m, x, $);
        if (A == null)
          return A;
        if (b) {
          var I = f.children;
          if (I !== void 0)
            if (v)
              if (ce(I)) {
                for (var H = 0; H < I.length; H++)
                  ke(I[H], a);
                Object.freeze && Object.freeze(I);
              } else
                R("React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead.");
            else
              ke(I, a);
        }
        if (B.call(f, "key")) {
          var j = k(a), O = Object.keys(f).filter(function(gt) {
            return gt !== "key";
          }), fe = O.length > 0 ? "{key: someKey, " + O.join(": ..., ") + ": ...}" : "{key: someKey}";
          if (!Me[j + fe]) {
            var mt = O.length > 0 ? "{" + O.join(": ..., ") + ": ...}" : "{}";
            R(`A props object containing a "key" prop is being spread into JSX:
  let props = %s;
  <%s {...props} />
React keys must be passed directly to JSX without using spread:
  let props = %s;
  <%s key={someKey} {...props} />`, fe, j, mt, j), Me[j + fe] = !0;
          }
        }
        return a === r ? lt(A) : ut(A), A;
      }
    }
    function ht(a, f, m) {
      return Fe(a, f, m, !0);
    }
    function ft(a, f, m) {
      return Fe(a, f, m, !1);
    }
    var dt = ft, pt = ht;
    K.Fragment = r, K.jsx = dt, K.jsxs = pt;
  }()), K;
}
process.env.NODE_ENV === "production" ? pe.exports = qr() : pe.exports = Kr();
var zr = pe.exports;
const Xr = () => {
  const o = St(null);
  return wt(() => {
    o.current && new Br(o.current);
  }, []), /* @__PURE__ */ zr.jsx("div", { ref: o, className: "ubuntu-terminal-theme" });
};
export {
  Xr as ReactTerminal,
  Br as TSTerminal
};
