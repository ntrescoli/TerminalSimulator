function globToRegExp(pattern) {
  const escaped = pattern.replace(/([.+^${}()|[\]\\])/g, '\\$1');
  const regexString = `^${escaped.replace(/\*/g, '.*').replace(/\?/g, '.')}$`;
  return new RegExp(regexString);
}

function test(pattern, candidates) {
  const re = globToRegExp(pattern);
  console.log(`pattern: ${pattern} -> ${re}`);
  for (const c of candidates) {
    console.log(`  ${c}: ${re.test(c)}`);
  }
}

console.log('Testing glob patterns');
test('*.txt', ['a.txt','b.txt','c.log','note.txt']);
test('a?.txt', ['a1.txt','a2.txt','ab.txt','aa.txt']);
test('file?.js', ['file1.js','file10.js','filea.js','file_.js']);
test('?.md', ['a.md','ab.md','!.md']);
