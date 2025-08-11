/**
 * Main entry point for Web# compiler
 */
import { Lexer } from './lexer/lexer.js';
import { Parser } from './parser/parser.js';
export class WebSharpCompiler {
    compile(source) {
        // Phase 1: Lexical analysis
        const lexer = new Lexer(source);
        const tokens = lexer.tokenize();
        // Phase 2: Parsing
        const parser = new Parser(tokens);
        const ast = parser.parse();
        return ast;
    }
    compileToJson(source) {
        const ast = this.compile(source);
        return JSON.stringify(ast.toJSON(), null, 2);
    }
}
// Export main classes for external use
export { Lexer } from './lexer/lexer.js';
export { Parser, ParseError } from './parser/parser.js';
export { TokenType } from './lexer/tokens.js';
export * from './ast/nodes.js';
// Main function for CLI usage
export async function main() {
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
    }
    catch (error) {
        console.error('Compilation error:', error);
        process.exit(1);
    }
}
