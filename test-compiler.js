import { readFileSync } from 'fs';
import { WebSharpCompiler } from './dist/index.js';

const source = readFileSync('example.ws', 'utf8');
const compiler = new WebSharpCompiler();

try {
  console.log('=== Compiling Web# source ===');
  console.log(source);
  console.log('\n=== Generated AST JSON ===');
  const json = compiler.compileToJson(source);
  console.log(json);
  console.log('\n=== Compilation successful! ===');
} catch (error) {
  console.error('Compilation failed:', error.message);
  process.exit(1);
}
