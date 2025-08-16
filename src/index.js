/**
 * Main entry point for Web# compiler
 */
import { Lexer } from './lexer/lexer';
import { Parser } from './parser/parser';
import { SemanticAnalyzer } from './semantic/analyzer';
import { JavaScriptGenerator } from './codegen/generator';
export class WebSharpCompiler {
    semanticAnalyzer;
    codeGenerator;
    constructor(options = {}) {
        this.semanticAnalyzer = new SemanticAnalyzer();
        this.codeGenerator = new JavaScriptGenerator(options);
    }
    compile(source) {
        // Phase 1: Lexical analysis
        const lexer = new Lexer(source);
        const tokens = lexer.tokenize();
        // Phase 2: Parsing
        const parser = new Parser(tokens);
        const ast = parser.parse();
        return ast;
    }
    analyze(source) {
        // First compile to get the AST
        const ast = this.compile(source);
        // Then perform semantic analysis with original source
        return this.semanticAnalyzer.analyzeWithSource(ast, source);
    }
    compileToJson(source) {
        const ast = this.compile(source);
        return JSON.stringify(ast.toJSON(), null, 2);
    }
    compileToJavaScript(source) {
        const ast = this.compile(source);
        return this.codeGenerator.generate(ast);
    }
    compileWithAnalysis(source) {
        const ast = this.compile(source);
        const analysis = this.semanticAnalyzer.analyzeWithSource(ast, source);
        const javascript = this.codeGenerator.generate(ast);
        return { ast, analysis, javascript };
    }
}
// Export main classes for external use
export { Lexer } from './lexer/lexer';
export { Parser, ParseError } from './parser/parser';
export { TokenType } from './lexer/tokens';
export * from './ast/nodes';
export { SemanticAnalyzer, SemanticError } from './semantic/analyzer';
export { JavaScriptGenerator } from './codegen/generator';
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
