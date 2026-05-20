import { FileSystem } from '../src/slices/filesystem/application/services/FileSystem';
import { Environment } from '../src/slices/system/domain/entities/Environment';

export function createTestContext() {
  const env = new Environment();
  env.set('USER', 'root');
  env.set('HOSTNAME', 'ubuntu-server');
  const fs = new FileSystem(env);

  const history: string[] = ['ls', 'pwd', 'echo hi'];
  const flagValues: Record<string,string|boolean> = {};
  const kernel = {
    getUptime: () => 1000 * 60 * 60,
    getHistory: () => history,
    clearHistory: () => {
      history.length = 0;
    },
    processCommandLine: async (input: string) => `executed: ${input}`,
  } as any;

  const userManager = {
    getUsers: () => [],
    getGroups: () => [],
    getUserByName: (n: string) => undefined,
    getGroupByName: (g: string) => undefined,
    saveUser: (_: any) => null,
    saveGroup: (_: any) => null,
    deleteUser: (_: string) => null,
    deleteGroup: (_: string) => null,
    addUserToGroup: (_: string, _g: string) => null,
  } as any;

  const base = {
    args: [] as string[],
    options: [] as string[],
    rawArgs: [] as string[],
    rawInput: '',
    flagValues,
    fs,
    env,
    userManager,
    hasFlag: (name: string) => !!flagValues[name],
    kernel,
    pipeInput: undefined,
  } as any;

  return { env, fs, userManager, kernel, base };
}

export async function loadCommand(modulePath: string) {
  const mod = await import(modulePath);
  const candidates = [
    'Command', 'default', 'Touch', 'Mkdir', 'Ls', 'Cd', 'Mv', 'Cp', 'Rm', 'Rmdir', 'File', 'Pwd',
    'AddUser', 'AddGroup', 'UserAdd', 'Useradd', 'Addgroup', 'DelUser', 'DelGroup', 'Groups',
    'Whoami', 'Who', 'Uptime', 'History', 'Help', 'Env', 'Echo', 'DateCommand', 'Clear', 'Unalias',
    'Sudo', 'Su', 'Alias', 'Cal', 'Chown', 'Chgrp',
  ];
  for (const name of candidates) {
    if (mod[name]) return mod[name];
  }
  const found = Object.values(mod).find((v: any) => v && typeof v.execute === 'function');
  if (found) return found as any;
  throw new Error('No command export found in ' + modulePath);
}
