/**
 * Main entry point for Web# compiler
 */

import { Lexer } from './lexer/lexer';
import { Parser } from './parser/parser';
import { CompilationUnitNode } from './ast/nodes';

export class WebSharpCompiler {
  public compile(source: string): CompilationUnitNode {
    // Phase 1: Lexical analysis
    const lexer = new Lexer(source);
    const tokens = lexer.tokenize();

    // Phase 2: Parsing
    const parser = new Parser(tokens);
    const ast = parser.parse();

    return ast;
  }

  public compileToJson(source: string): string {
    const ast = this.compile(source);
    return JSON.stringify(ast.toJSON(), null, 2);
  }
}

// Export main classes for external use
export { Lexer } from './lexer/lexer';
export { Parser, ParseError } from './parser/parser';
export { TokenType, Token } from './lexer/tokens';
export * from './ast/nodes';

// Main function for CLI usage
export async function main(): Promise<void> {
  const { readFileSync } = await import('fs');
  const process = await import('process');
  
  if (process.argv.length < 3) {
    console.error('Usage: node dist/index.js <source-file>');
    process.exit(1);
  }

  const sourceFile = process.argv[2];
  
  try {
    const source = readFileSync(sourceFile, 'utf8');
    const compiler = new WebSharpCompiler();
    const json = compiler.compileToJson(source);
    console.log(json);
  } catch (error) {
    console.error('Compilation error:', error);
    process.exit(1);
  }
}
