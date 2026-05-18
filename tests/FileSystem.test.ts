import { beforeEach, describe, expect, it } from 'vitest';
import { FileSystem } from '../src/slices/filesystem/application/services/FileSystem';
import { Environment } from '../src/slices/system/domain/entities/Environment';

describe('FileSystem (basic)', () => {
  let env: Environment;
  let fs: FileSystem;

  beforeEach(() => {
    env = new Environment();
    env.set('USER', 'root');
    fs = new FileSystem(env);
  });

  it('creates and reads a file via touch & cat', () => {
    const res = fs.touch('test.txt', 'hello world');
    expect(res.isSuccess).toBe(true);

    const cat = fs.cat('test.txt');
    expect(cat.isSuccess).toBe(true);
    expect(cat.getValue()).toBe('hello world');
  });

  it('writeFile append true appends content', () => {
    fs.touch('a.txt', 'first');
    const r = fs.writeFile('a.txt', 'second', true);
    expect(r.isSuccess).toBe(true);

    const c = fs.cat('a.txt');
    expect(c.isSuccess).toBe(true);
    expect(c.getValue()).toBe('first\nsecond');
  });

  it('mkdir creates a directory and changeDirectory navigates into it', () => {
    const m = fs.mkdir('mydir');
    expect(m.isSuccess).toBe(true);

    const cd = fs.changeDirectory('mydir');
    expect(cd.isSuccess).toBe(true);
    expect(fs.getCurrentDirectory().name).toBe('mydir');
  });

});
