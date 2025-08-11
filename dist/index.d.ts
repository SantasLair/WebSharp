/**
 * Main entry point for Web# compiler
 */
import { CompilationUnitNode } from './ast/nodes.js';
export declare class WebSharpCompiler {
    compile(source: string): CompilationUnitNode;
    compileToJson(source: string): string;
}
export { Lexer } from './lexer/lexer.js';
export { Parser, ParseError } from './parser/parser.js';
export { TokenType, Token } from './lexer/tokens.js';
export * from './ast/nodes.js';
export declare function main(): Promise<void>;
