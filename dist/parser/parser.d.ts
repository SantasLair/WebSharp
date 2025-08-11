/**
 * Parser implementation for Web#
 * Builds Abstract Syntax Tree from tokens
 */
import { Token } from '../lexer/tokens.js';
import { CompilationUnitNode } from '../ast/nodes.js';
export declare class ParseError extends Error {
    readonly token: Token;
    constructor(message: string, token: Token);
}
export declare class Parser {
    private tokens;
    private current;
    constructor(tokens: Token[]);
    parse(): CompilationUnitNode;
    private parseUsing;
    private parseClass;
    private parseClassMember;
    private parseMethod;
    private parseProperty;
    private parseType;
    private skipBlock;
    private skipToSemicolon;
    private match;
    private check;
    private advance;
    private isAtEnd;
    private peek;
    private previous;
    private consume;
    private getSourceLocation;
}
