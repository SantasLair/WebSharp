/**
 * Main entry point for Web# compiler
 */

import { Lexer } from './lexer/lexer';
import { Parser } from './parser/parser';
import { CompilationUnitNode } from './ast/nodes';
import { SemanticAnalyzer, AnalysisResult } from './semantic/analyzer';

export class WebSharpCompiler {
  private semanticAnalyzer: SemanticAnalyzer;

  constructor() {
    this.semanticAnalyzer = new SemanticAnalyzer();
  }

  public compile(source: string): CompilationUnitNode {
    // Phase 1: Lexical analysis
    const lexer = new Lexer(source);
    const tokens = lexer.tokenize();

    // Phase 2: Parsing
    const parser = new Parser(tokens);
    const ast = parser.parse();

    return ast;
  }

  public analyze(source: string): AnalysisResult {
    // First compile to get the AST
    const ast = this.compile(source);
    
    // Then perform semantic analysis with original source
    return this.semanticAnalyzer.analyzeWithSource(ast, source);
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
export { SemanticAnalyzer, SemanticError, AnalysisResult } from './semantic/analyzer';

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
